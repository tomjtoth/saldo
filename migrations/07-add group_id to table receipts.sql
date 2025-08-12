ALTER TABLE receipts ADD COLUMN group_id INTEGER REFERENCES groups(id);
ALTER TABLE receipts_archive ADD COLUMN group_id INTEGER REFERENCES groups(id);

UPDATE receipts SET group_id = 1;
UPDATE receipts_archive SET group_id = 1;


----------
-- DOWN --
----------


ALTER TABLE receipts DROP COLUMN group_id;
ALTER TABLE receipts_archive DROP COLUMN group_id;
