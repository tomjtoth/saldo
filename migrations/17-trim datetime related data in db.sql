DELETE FROM metadata WHERE "name" = 'datetime';

INSERT INTO metadata ("name", "description", payload)
SELECT
    'datetime anchor',
    'all timestamps are calculated from this instead of unixepoch',
    '2020-01-01';


----------
-- DOWN --
----------


DELETE FROM metadata WHERE "name" = 'datetime anchor';

INSERT INTO metadata ("name", "description", payload)
SELECT 'datetime', NULL, json_object(
    'anchor', '2020-01-01',
    'format', 'yyyy-MM-dd HH:mm:ss',
    'timezone', 'Europe/Helsinki'
);
