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
    key AS id,
    substr(value, 0,instr(value, '.')) AS tableName,
    substr(value, instr(value, '.')+1, length(value)) AS columnName
FROM "Meta", json_each(data) 
WHERE info = 'tableColumnId';

CREATE VIEW "archives" AS
SELECT
    tableName,
    entityPk1 AS pk1,
    entityPk2 AS pk2,
	a.revisionId AS revisionId,
    json_group_object("names".columnName, data) AS payload,
    r.createdAt AS "revision.createdAtInt",
	u.name AS "revision.createdBy.name"
FROM "Archive" a
INNER JOIN "tableColumnNames" AS "names" ON (a.tableColumnId = "names".id)
INNER JOIN "Revision" r ON r.id = a.revisionId
INNER JOIN "User" u ON u.id = r.createdBy
GROUP BY tableName, entityPk1, entityPk2, a.revisionId
ORDER BY a.revisionId DESC;
