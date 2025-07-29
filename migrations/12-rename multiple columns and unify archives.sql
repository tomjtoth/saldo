PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;



-- rename old tables



ALTER TABLE revisions RENAME TO old_revisions;
ALTER TABLE users RENAME TO old_users;
ALTER TABLE groups RENAME TO old_groups;
ALTER TABLE memberships RENAME TO old_memberships;
ALTER TABLE categories RENAME TO old_categories;
ALTER TABLE receipts RENAME TO old_receipts;
ALTER TABLE items RENAME TO old_items;
ALTER TABLE item_shares RENAME TO old_item_shares;



-- create the new schema



CREATE TABLE archives (
    id INTEGER PRIMARY KEY,
    /*
     *   REFERENCES the column of a table
     *   TODO: example query
     */
    table_column_id INTEGER NOT NULL, 
    
    -- REFERENCES 1st/only PK of a table
    entity_pk1 INTEGER NOT NULL, 
    
    -- REFERENCES the 2nd PK of a table
    entity_pk2 INTEGER, 
    revision_id INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    payload BLOB -- TEXT | INTEGER
);

CREATE INDEX idx_archives_entity ON archives (table_column_id, entity_pk1, entity_pk2);

CREATE TABLE revisions (
    id INTEGER PRIMARY KEY,
    created_at INTEGER NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users (id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    revision_id INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL DEFAULT (0),

    email TEXT NOT NULL UNIQUE,
    name TEXT,
    image TEXT,
    default_group_id INTEGER REFERENCES groups (id)
);

CREATE TABLE groups (
    id INTEGER PRIMARY KEY,
    revision_id INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL DEFAULT (0),

    name TEXT NOT NULL,
    description TEXT,
    uuid TEXT
);

CREATE TABLE memberships (
    user_id INTEGER REFERENCES users (id),
    group_id INTEGER REFERENCES groups (id),
    revision_id INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL DEFAULT (0),

    admin INTEGER,
    default_category_id INTEGER REFERENCES categories (id),

    PRIMARY KEY (user_id, group_id)
) WITHOUT ROWID;

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    revision_id INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL DEFAULT (0),

    group_id INTEGER REFERENCES groups (id),
    name TEXT,
    description TEXT
);

CREATE TABLE receipts (
    id INTEGER PRIMARY KEY,
    revision_id INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL DEFAULT (0),

    group_id INTEGER REFERENCES groups (id),
    paid_by INTEGER REFERENCES users (id),
    paid_on INTEGER
);

CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    revision_id INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL DEFAULT (0),

    receipt_id INTEGER REFERENCES receipts (id),
    category_id INTEGER REFERENCES categories (id),

    cost INTEGER NOT NULL,
    notes TEXT
);

CREATE TABLE item_shares (
    item_id INTEGER REFERENCES items (id),
    user_id INTEGER REFERENCES users (id),
    revision_id INTEGER NOT NULL REFERENCES revisions (id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL DEFAULT (0),

    share INTEGER NOT NULL,

    PRIMARY KEY (item_id, user_id)
) WITHOUT ROWID;



-- transfer data from old tables to new ones



INSERT INTO meta (info, payload)
    SELECT 'datetime', jsonb_object('anchor', '2020-01-01', 'timezone', 'Europe/Helsinki')
    UNION
    SELECT 'statuses',  jsonb_array('ACTIVE', 'INACTIVE')
    UNION
    SELECT 'table_column_id', jsonb_array(
        'categories.name', 'categories.description', 'categories.status_id', 'categories.group_id',
        'groups.name', 'groups.description', 'groups.status_id', 'groups.uuid',
        'memberships.status_id', 'memberships.default_category_id'
    );

INSERT INTO archives (entity_pk1, entity_pk2, revision_id, table_column_id, payload)
    SELECT id, NULL, rev_id, 2, status_id - 1 FROM categories_archive
    UNION
    SELECT id, NULL, rev_id, 3, group_id FROM categories_archive
    UNION
    SELECT id, NULL, rev_id, 0, name FROM categories_archive
    UNION
    SELECT id, NULL, rev_id, 1, description FROM categories_archive
    UNION
    SELECT id, NULL, rev_id, 6, status_id - 1 FROM groups_archive
    UNION
    SELECT id, NULL, rev_id, 4, name FROM groups_archive
    UNION
    SELECT id, NULL, rev_id, 5, description FROM groups_archive
    UNION
    SELECT id, NULL, rev_id, 7, uuid FROM groups_archive
    UNION
    SELECT group_id, user_id, rev_id, 8, status_id - 1 + 2 * admin FROM memberships_archive
    UNION
    SELECT group_id, user_id, rev_id, 9, default_cat_id FROM memberships_archive;

INSERT INTO revisions (id, created_at, created_by)
    SELECT id, rev_on, rev_by FROM OLD_REVISIONS;

INSERT INTO users (id, revision_id, status_id, email, name, default_group_id)
    SELECT id, rev_id, status_id - 1, email, name, default_group_id
    FROM OLD_USERS;

INSERT INTO groups (id, revision_id, status_id, name, description, uuid)
    SELECT id, rev_id, status_id - 1, name, description, uuid
    FROM OLD_GROUPS;

INSERT INTO memberships (group_id, user_id, revision_id, status_id, default_category_id)
    SELECT group_id, user_id, rev_id, status_id -1 + 2 * admin, default_cat_id
    FROM OLD_MEMBERSHIPS;

INSERT INTO categories (id, revision_id, status_id, group_id, name, description)
    SELECT id, rev_id, status_id - 1, group_id, name, description
    FROM OLD_CATEGORIES;
    
INSERT INTO receipts (id, revision_id, status_id, group_id, paid_on, paid_by)
    SELECT id, rev_id, status_id - 1, group_id, paid_on, paid_by
    FROM OLD_RECEIPTS;

INSERT INTO items (id, revision_id, status_id, receipt_id, category_id, cost, notes)
    SELECT id, rev_id, status_id - 1, rcpt_id, cat_id, cost, notes
    FROM OLD_ITEMS;

INSERT INTO item_shares (item_id, user_id, revision_id, status_id, share)
    SELECT item_id, user_id, rev_id, status_id - 1, share
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


COMMIT TRANSACTION;
PRAGMA foreign_keys = ON;



----------
-- DOWN --
----------



SELECT 42,'sorry folks, this was a one-way ticket';
