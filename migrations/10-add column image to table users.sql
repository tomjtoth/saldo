ALTER TABLE users ADD COLUMN image TEXT;
ALTER TABLE users_archive ADD COLUMN image TEXT;


----------
-- DOWN --
----------


ALTER TABLE users_archive DROP COLUMN image;
ALTER TABLE users DROP COLUMN image;
