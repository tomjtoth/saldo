CREATE VIEW "consumption" AS
SELECT
  r.groupId,
  r.paidOn,
  r.paidBy,
  COALESCE(sh.userId, r.paidBy) AS paidTo,
  i.id AS itemId,
  i.categoryId,
  cost / 100.0 * coalesce(share * 1.0 / sum(share) OVER (PARTITION BY i.id), 1) AS share
FROM "Receipt" r
INNER JOIN "Item" i ON (r.id = i.receiptId AND i.statusId = 0)
LEFT JOIN "ItemShare" sh ON (sh.itemId = i.id AND sh.statusId = 0)
WHERE r.statusId = 0
ORDER BY paidOn;

CREATE VIEW "tableColumnNames" AS
SELECT
    cast(key AS INTEGER) AS id,
    cast(substr(value, 0,instr(value, '.')) AS  TEXT) AS tableName,
    cast(substr(value, instr(value, '.')+1, length(value)) AS TEXT) AS columnName
FROM "Meta", json_each(data)
WHERE info = 'tableColumnIds';

CREATE VIEW "archives" AS
WITH by_changes AS (
    SELECT
        tableName,
        entityPk1 AS pk1,
        entityPk2 AS pk2,
        json_insert(
            json_group_object("names".columnName, data),
            '$.revision', json_object(
                'createdAtInt', r.createdAt,
                'createdBy', json_object('name', u.name )
            ),
            '$.revisionId', a.revisionId
        ) AS "data"
    FROM "Archive" a
    INNER JOIN "tableColumnNames" AS "names" ON (a.tableColumnId = "names".id)
    INNER JOIN "Revision" r ON r.id = a.revisionId
    INNER JOIN "User" u ON u.id = r.createdBy
    GROUP BY tableName, entityPk1, entityPk2, a.revisionId
    ORDER BY r.createdAt DESC
),

by_pk2 AS (
    SELECT
        tableName,
        pk1,
        concat( json_quote(cast(coalesce(pk2, 'null') AS TEXT)), ': [', group_concat(data), ']') AS data
    FROM by_changes
    GROUP BY tableName, pk1, pk2
),

by_pk1 AS (
    SELECT
        tableName,
        concat( json_quote(cast(pk1 AS TEXT)), ': {' , group_concat(data), '}') AS data
    FROM by_pk2
    GROUP BY tableName, pk1
)

SELECT
    tableName,
    concat('{', group_concat(data), '}') AS data
FROM by_pk1 GROUP BY tableName
