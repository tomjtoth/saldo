-- will not be tracked by revisions
CREATE TABLE chart_colors (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE,
    member_id INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,

    -- store hex of colors as int, then parse with base 16
    color INTEGER NOT NULL
);

CREATE UNIQUE INDEX idx_chart_colors_uid_gid_mid ON chart_colors (user_id, group_id, member_id);

ALTER TABLE users DROP COLUMN chart_style;
ALTER TABLE memberships DROP COLUMN chart_style;

-- DOWN --

DROP TABLE chart_colors;
