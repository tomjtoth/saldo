ALTER TABLE users DROP COLUMN passwd;

----------
-- DOWN --
----------

ALTER TABLE users ADD COLUMN passwd TEXT NOT NULL;
