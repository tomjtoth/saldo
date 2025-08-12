ALTER TABLE memberships ADD COLUMN default_cat_id INTEGER REFERENCES categories(id);
ALTER TABLE memberships_archive ADD COLUMN default_cat_id INTEGER REFERENCES categories(id);


----------
-- DOWN --
----------


ALTER TABLE memberships_archive DROP COLUMN default_cat_id;
ALTER TABLE memberships DROP COLUMN default_cat_id;
