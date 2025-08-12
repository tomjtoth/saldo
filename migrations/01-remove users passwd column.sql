ALTER TABLE users DROP COLUMN passwd;
ALTER TABLE users_archive DROP COLUMN passwd;

----------
-- DOWN --
----------

ALTER TABLE users ADD COLUMN passwd TEXT NOT NULL;
ALTER TABLE users_archive ADD COLUMN passwd TEXT NOT NULL;
