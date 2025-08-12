ALTER TABLE users ADD COLUMN default_group_id INTEGER REFERENCES groups(id);
ALTER TABLE users_archive ADD COLUMN default_group_id INTEGER REFERENCES groups(id);


----------
-- DOWN --
----------


ALTER TABLE users DROP COLUMN default_group_id;
ALTER TABLE users_archive DROP COLUMN default_group_id;
