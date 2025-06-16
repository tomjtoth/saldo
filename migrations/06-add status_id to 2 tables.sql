ALTER TABLE groups ADD COLUMN status_id INTEGER REFERENCES statuses(id);
ALTER TABLE groups_archive ADD COLUMN status_id INTEGER REFERENCES statuses(id);

ALTER TABLE memberships ADD COLUMN status_id INTEGER REFERENCES statuses(id);
ALTER TABLE memberships_archive ADD COLUMN status_id INTEGER REFERENCES statuses(id);


----------
-- DOWN --
----------


ALTER TABLE groups DROP COLUMN status_id;
ALTER TABLE groups_archive DROP COLUMN status_id;

ALTER TABLE memberships DROP COLUMN status_id;
ALTER TABLE memberships_archive DROP COLUMN status_id;
