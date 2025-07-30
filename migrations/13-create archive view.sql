CREATE VIEW vw_archives AS
WITH cte AS (
    SELECT
    key AS id,
    substr(value, 0,instr(value, '.')) AS tableName,
    substr(value, instr(value, '.')+1, length(value)) AS columnName
    FROM meta, json_each(payload) WHERE info = 'table_column_id'
)
SELECT
    tableName,
    entity_pk1 AS pk1,
    entity_pk2 AS pk2,
	a.revision_id AS revisionId,
    json_group_object(cte.columnName, payload) AS payload,
    r.created_at AS "Revision.createdAtInt",
	u.name AS "Revision.User.name"
FROM archives a
INNER JOIN cte ON (a.table_column_id = cte.id)
INNER JOIN revisions r ON r.id = a.revision_id
INNER JOIN users u ON u.id = r.created_by
GROUP BY tableName, entity_pk1, entity_pk2, a.revision_id
ORDER BY a.revision_id DESC

----------
-- DOWN --
----------

DROP VIEW vw_archives;
