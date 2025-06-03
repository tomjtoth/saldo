INSERT INTO statuses (description) VALUES ('INACTIVE');

----------
-- DOWN --
----------

DELETE FROM statuses WHERE description = 'INACTIVE';
