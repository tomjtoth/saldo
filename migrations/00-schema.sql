CREATE TABLE statuses (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL
);

INSERT INTO statuses (description) VALUES ('ACTIVE');

CREATE TABLE revisions (
    id INTEGER PRIMARY KEY,
    rev_on INTEGER NOT NULL,
    rev_by INTEGER REFERENCES users (id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,

    status_id INTEGER REFERENCES statuses (id),

    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    passwd TEXT NOT NULL
);

CREATE TABLE users_archive (
    id INTEGER REFERENCES users,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    status_id INTEGER REFERENCES statuses (id),

    email TEXT NOT NULL,
    name TEXT NOT NULL,
    passwd TEXT NOT NULL,

    PRIMARY KEY (id, rev_id)
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    status_id INTEGER REFERENCES statuses (id),

    description TEXT NOT NULL
);

CREATE TABLE categories_archive (
    id INTEGER REFERENCES categories,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    status_id INTEGER REFERENCES statuses (id),

    description TEXT NOT NULL,

    PRIMARY KEY (id, rev_id)
);

CREATE TABLE receipts (
    id INTEGER PRIMARY KEY,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    status_id INTEGER REFERENCES statuses (id),

    paid_on INTEGER,
    paid_by INTEGER REFERENCES users (id)
);

CREATE TABLE receipts_archive (
    id INTEGER REFERENCES receipts,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    status_id INTEGER REFERENCES statuses (id),

    paid_on INTEGER,
    paid_by INTEGER REFERENCES users (id),

    PRIMARY KEY (id, rev_id)
);

CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    rcpt_id INTEGER REFERENCES receipts (id),
    cat_id INTEGER REFERENCES categories (id),
    status_id INTEGER REFERENCES statuses (id),

    cost INTEGER NOT NULL,
    notes TEXT
);

CREATE TABLE items_archive (
    id INTEGER REFERENCES items,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    rcpt_id INTEGER REFERENCES receipts (id),
    cat_id INTEGER REFERENCES categories (id),
    status_id INTEGER REFERENCES statuses (id),

    cost INTEGER NOT NULL,
    notes TEXT,

    PRIMARY KEY (id, rev_id)
);

CREATE TABLE item_shares (
    item_id INTEGER REFERENCES items (id),
    user_id INTEGER REFERENCES users (id),
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    status_id INTEGER REFERENCES statuses (id),

    share INTEGER NOT NULL,

    PRIMARY KEY (item_id, user_id)
);

CREATE TABLE item_shares_archive (
    item_id INTEGER REFERENCES items (id),
    user_id INTEGER REFERENCES users (id),
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    status_id INTEGER REFERENCES statuses (id),

    share INTEGER NOT NULL,

    PRIMARY KEY (item_id, user_id, rev_id)
);


----------
-- DOWN --
----------


DROP TABLE revisions;
DROP TABLE statuses;

DROP TABLE users;
DROP TABLE users_archive;

DROP TABLE categories;
DROP TABLE categories_archive;

DROP TABLE receipts;
DROP TABLE receipts_archive;

DROP TABLE items;
DROP TABLE items_archive;

DROP TABLE item_shares;
DROP TABLE item_shares_archive;
