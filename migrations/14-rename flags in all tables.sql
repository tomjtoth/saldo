ALTER TABLE users RENAME status_id TO flags;
ALTER TABLE groups RENAME status_id TO flags;
ALTER TABLE memberships RENAME status_id TO flags;
ALTER TABLE categories RENAME status_id TO flags;
ALTER TABLE receipts RENAME status_id TO flags;
ALTER TABLE items RENAME status_id TO flags;
ALTER TABLE item_shares RENAME status_id TO flags;

UPDATE metadata SET name = 'flags' WHERE id = 3;
-- table_column_ids
UPDATE metadata SET payload = replace(payload, '.statusId"', '.flags"') WHERE id = 4;

-- DOWN --

ALTER TABLE users RENAME flags TO status_id;
ALTER TABLE groups RENAME flags TO status_id;
ALTER TABLE memberships RENAME flags TO status_id;
ALTER TABLE categories RENAME flags TO status_id;
ALTER TABLE receipts RENAME flags TO status_id;
ALTER TABLE items RENAME flags TO status_id;
ALTER TABLE item_shares RENAME flags TO status_id;

UPDATE metadata SET name = 'statuses' WHERE id = 3;
UPDATE metadata SET payload = replace(payload, '.flags"', '.statusId"') WHERE id = 4;
