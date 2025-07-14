-------- this migration converts all table and column names to camelCase
-- UP -- and extends the migrations table with a rowid
-------- 


ALTER TABLE migrations RENAME TO OLD_MIGRATIONS;
ALTER TABLE revisions RENAME TO OLD_REVISIONS;
ALTER TABLE users RENAME TO OLD_USERS;
ALTER TABLE groups RENAME TO OLD_GROUPS;
ALTER TABLE memberships RENAME TO OLD_MEMBERSHIPS;
ALTER TABLE categories RENAME TO OLD_CATEGORIES;
ALTER TABLE receipts RENAME TO OLD_RECEIPTS;
ALTER TABLE items RENAME TO OLD_ITEMS;
ALTER TABLE item_shares RENAME TO OLD_ITEM_SHARES;


-- create new tables


CREATE TABLE migrations (
    id INTEGER PRIMARY KEY,
    name TEXT
);

/*
    -- USAGE --

    INSERT INTO tableNames (name) SELECT 'categories'
	ON CONFLICT DO UPDATE SET name = name RETURNING id;
*/

CREATE TABLE tableNames (
    id INTEGER PRIMARY KEY,

    -- "table"
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE archives (
    id INTEGER PRIMARY KEY,
    tableId INTEGER NOT NULL REFERENCES tableNames (id),
    entityPk1 INTEGER NOT NULL,
    entityPk2 INTEGER,
    revisionId INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    
    /*
        typeof payload = {
            [column: string]: number | string
        }
    */
    payload BLOB
);

CREATE INDEX idx_archives_table_pk1_pk2 ON archives (tableId, entityPk1, entityPk2);

CREATE TABLE revisions (
    id INTEGER PRIMARY KEY,
    revisedOn INTEGER NOT NULL,
    revisedBy INTEGER REFERENCES users (id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    revisionId INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    statusId INTEGER REFERENCES statuses (id),

    email TEXT NOT NULL,
    name TEXT,
    image TEXT,
    defaultGroupId INTEGER REFERENCES groups (id)
);

CREATE TABLE groups (
    id INTEGER PRIMARY KEY,
    revisionId INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    statusId INTEGER REFERENCES statuses (id),

    name TEXT NOT NULL,
    description TEXT,
    uuid TEXT
);

CREATE TABLE memberships (
    userId INTEGER REFERENCES users (id),
    groupId INTEGER REFERENCES groups (id),
    revisionId INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    statusId INTEGER REFERENCES statuses (id),

    admin INTEGER,
    defaultCategoryId INTEGER REFERENCES categories (id),

    PRIMARY KEY (userId, groupId)
) WITHOUT ROWID;

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    revisionId INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    statusId INTEGER REFERENCES statuses (id),

    groupId INTEGER REFERENCES groups (id),
    name TEXT,
    description TEXT
);

CREATE TABLE receipts (
    id INTEGER PRIMARY KEY,
    revisionId INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    statusId INTEGER REFERENCES statuses (id),

    groupId INTEGER REFERENCES groups (id),
    paidBy INTEGER REFERENCES users (id),
    paidOn INTEGER
);

CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    revisionId INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    statusId INTEGER REFERENCES statuses (id),

    receiptId INTEGER REFERENCES receipts (id),
    categoryId INTEGER REFERENCES categories (id),

    cost INTEGER NOT NULL,
    notes TEXT
);

CREATE TABLE itemShares (
    itemId INTEGER REFERENCES items (id),
    userId INTEGER REFERENCES users (id),
    revisionId INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    statusId INTEGER REFERENCES statuses (id),

    share INTEGER NOT NULL,

    PRIMARY KEY (itemId, userId)
) WITHOUT ROWID;


-- transfer data from old tables to new ones


INSERT INTO migrations (name) 
    SELECT name FROM OLD_MIGRATIONS;

INSERT INTO revisions (id, revisedOn, revisedBy)
    SELECT id, rev_on, rev_by FROM OLD_REVISIONS;

INSERT INTO users
    (id, revisionId, statusId, email, name, defaultGroupId)
    SELECT id, rev_id, status_id, email, name, default_group_id
    FROM OLD_USERS;

INSERT INTO groups
    (id, revisionId, statusId, name, description, uuid)
    SELECT id, rev_id, status_id, name, description, uuid
    FROM OLD_GROUPS;

INSERT INTO tableNames (id, name) VALUES (1, 'groups'), (2, 'categories'), (3, 'memberships');

INSERT INTO archives (tableId, entityPk1, revisionId, payload)
    SELECT 1, id, rev_id, JSONB_OBJECT(
        'statusId', status_id, 
        'name', name, 
        'description', description, 
        'uuid', uuid
    )
    FROM groups_archive;

INSERT INTO memberships 
    (groupId, userId, revisionId, statusId, admin, defaultCategoryId)
    SELECT group_id, user_id, rev_id, status_id, admin, default_cat_id
    FROM OLD_MEMBERSHIPS;

INSERT INTO archives (tableId, entityPk1, entityPk2, revisionId, payload)
    SELECT 3, group_id, user_id, rev_id, JSONB_OBJECT(
        'statusId', status_id,
        'admin', admin,
        'defaultCategoryId', default_cat_id
    )
    FROM memberships_archive;

INSERT INTO categories 
    (id, revisionId, statusId, groupId, name, description)
    SELECT id, rev_id, status_id, group_id, name, description
    FROM OLD_CATEGORIES;
    
INSERT INTO archives (tableId, entityPk1, revisionId, payload)
    SELECT 2, id, rev_id, JSONB_OBJECT(
        'status_id', status_id,
        'group_id', group_id,
        'name', name,
        'description', description
    )
    FROM categories_archive;

INSERT INTO receipts 
    (id, revisionId, statusId, groupId, paidOn, paidBy)
    SELECT id, rev_id, status_id, group_id, paid_on, paid_by
    FROM OLD_RECEIPTS;

INSERT INTO items 
    (id, revisionId, statusId, receiptId, categoryId, cost, notes)
    SELECT id, rev_id, status_id, rcpt_id, cat_id, cost, notes
    FROM OLD_ITEMS;

INSERT INTO itemShares 
    (itemId, userId, revisionId, statusId, share)
    SELECT item_id, user_id, rev_id, status_id, share
    FROM OLD_ITEM_SHARES;


-- rm old tables and views


DROP TABLE OLD_REVISIONS;
DROP TABLE OLD_USERS;
DROP TABLE OLD_GROUPS;
DROP TABLE OLD_MEMBERSHIPS;
DROP TABLE OLD_CATEGORIES;
DROP TABLE OLD_RECEIPTS;
DROP TABLE OLD_ITEMS;
DROP TABLE OLD_ITEM_SHARES;

DROP TABLE users_archive;
DROP TABLE groups_archive;
DROP TABLE memberships_archive;
DROP TABLE categories_archive;
DROP TABLE receipts_archive;
DROP TABLE items_archive;
DROP TABLE item_shares_archive;

DROP VIEW consumption;


-- recreate view


CREATE VIEW consumption AS
SELECT
  r.groupId,
  r.paidOn,
  r.paidBy,
  COALESCE (sh.userId, r.paidBy) AS paidTo,
  i.id AS itemId,
  i.categoryId,
  cost / 100.0 * COALESCE (share * 1.0 / SUM (share) OVER (PARTITION BY i.id), 1) AS share
FROM receipts r
INNER JOIN items i ON r.id = i.receiptId
LEFT JOIN itemShares sh ON (sh.itemId = i.id AND sh.statusId = 1)
WHERE r.statusId = 1 AND i.statusId = 1
ORDER BY paidOn;


----------
-- DOWN --
----------


SELECT 42,'sorry folks, this was a one-way ticket';
