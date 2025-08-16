CREATE VIEW "consumption" AS
SELECT
  r.group_id,
  r.paid_on,
  r.paid_by,
  coalesce(sh.user_id, r.paid_by) AS paid_to,
  i.id AS item_id,
  i.category_id,
  cost / 100.0 * coalesce(share * 1.0 / sum(share) OVER (PARTITION BY i.id), 1) AS share
FROM receipts r
INNER JOIN items i ON r.id = i.receipt_id
LEFT JOIN item_shares sh ON (sh.item_id = i.id AND sh.status_id = 1)
WHERE r.status_id = 1 AND i.status_id = 1
ORDER BY paid_on;


CREATE VIEW "table_column_names" AS
SELECT
    cast(key AS INTEGER) AS id,
    cast(substr(value, 0,instr(value, '.')) AS  TEXT) AS table_name,
    cast(substr(value, instr(value, '.') + 1, length(value)) AS TEXT) AS column_name
FROM "metadata", json_each("payload")
WHERE "name" = 'table_column_ids';

CREATE VIEW "vw_archives" AS
WITH by_changes AS (
    SELECT
        table_name,
        entity_pk1 AS pk1,
        entity_pk2 AS pk2,
        json_insert(
            json_group_object("names".column_name, "payload"),
            '$.revision', json_object(
                'createdAt', r.created_at,
                'createdBy', json_object('name', u.name )
            ),
            '$.revisionId', a.revision_id
        ) AS "payload"
    FROM "archives" a
    INNER JOIN "table_column_names" AS "names" ON (a.table_column_id = "names".id)
    INNER JOIN "revisions" r ON r.id = a.revision_id
    INNER JOIN "users" u ON u.id = r.created_by
    GROUP BY table_name, entity_pk1, entity_pk2, a.revision_id
    ORDER BY r.created_at DESC
),

by_pk2 AS (
    SELECT
        table_name,
        pk1,
        concat( json_quote(cast(coalesce(pk2, 'null') AS TEXT)), ': [', group_concat("payload"), ']') AS "payload"
    FROM by_changes
    GROUP BY table_name, pk1, pk2
),

by_pk1 AS (
    SELECT
        table_name,
        concat( json_quote(cast(pk1 AS TEXT)), ': {' , group_concat("payload"), '}') AS "payload"
    FROM by_pk2
    GROUP BY table_name, pk1
)

SELECT
    table_name AS tableName, 
    concat('{', group_concat("payload"), '}') AS "payload"
FROM by_pk1 GROUP BY table_name
