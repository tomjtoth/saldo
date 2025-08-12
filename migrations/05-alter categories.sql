ALTER TABLE categories ADD COLUMN group_id INTEGER REFERENCES groups(id);
ALTER TABLE categories_archive ADD COLUMN group_id INTEGER REFERENCES groups(id);

ALTER TABLE categories ADD COLUMN name TEXT;
ALTER TABLE categories_archive ADD COLUMN name TEXT;

UPDATE categories SET name = description;
UPDATE categories_archive SET name = description;

-- redefine 'description' as a nullable column
ALTER TABLE categories DROP COLUMN description;
ALTER TABLE categories_archive DROP COLUMN description;

ALTER TABLE categories ADD COLUMN description TEXT;
ALTER TABLE categories_archive ADD COLUMN description TEXT;


----------
-- DOWN --
----------


UPDATE categories SET description = name;
UPDATE categories_archive SET description = name;

ALTER TABLE categories DROP COLUMN name;
ALTER TABLE categories_archive DROP COLUMN name;

ALTER TABLE categories DROP COLUMN group_id;
ALTER TABLE categories_archive DROP COLUMN group_id;
