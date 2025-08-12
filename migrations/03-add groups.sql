CREATE TABLE groups (
    id INTEGER PRIMARY KEY,
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    uuid TEXT
);

CREATE TABLE groups_archive (
    id INTEGER REFERENCES groups(id),
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    uuid TEXT,

    PRIMARY KEY(id, rev_id)
);


----------
-- DOWN --
----------

DROP TABLE groups_archive;
DROP TABLE groups;
