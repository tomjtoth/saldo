CREATE VIEW consumption AS
SELECT
  r.group_id AS groupId,
  r.paid_on AS paidOn,
  r.paid_by AS paidBy,
  COALESCE(sh.user_id, r.paid_by) AS paidTo,
  i.id AS itemId,
  i.cat_id AS catId,
  cost / 100.0 * COALESCE(share * 1.0 / SUM(share) OVER (PARTITION BY i.id), 1) AS share
FROM receipts r
INNER JOIN items i ON r.id = i.rcpt_id
LEFT JOIN item_shares sh ON (sh.item_id = i.id AND sh.status_id = 1)
WHERE r.status_id = 1 AND i.status_id = 1
ORDER BY paid_on;


----------
-- DOWN --
----------


DROP VIEW consumption;
