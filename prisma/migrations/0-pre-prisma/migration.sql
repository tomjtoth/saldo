CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rev_id" INTEGER,
    "status_id" INTEGER,
    "group_id" INTEGER,
    "name" TEXT,
    "description" TEXT,
    CONSTRAINT "categories_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "categories_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "categories_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "categories_archive" (
    "id" INTEGER,
    "rev_id" INTEGER,
    "status_id" INTEGER,
    "group_id" INTEGER,
    "name" TEXT,
    "description" TEXT,

    PRIMARY KEY ("id", "rev_id"),
    CONSTRAINT "categories_archive_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "categories_archive_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "categories_archive_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "categories_archive_id_fkey" FOREIGN KEY ("id") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "groups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rev_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "uuid" TEXT,
    "status_id" INTEGER,
    CONSTRAINT "groups_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "groups_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "groups_archive" (
    "id" INTEGER,
    "rev_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "uuid" TEXT,
    "status_id" INTEGER,

    PRIMARY KEY ("id", "rev_id"),
    CONSTRAINT "groups_archive_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "groups_archive_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "groups_archive_id_fkey" FOREIGN KEY ("id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "item_shares" (
    "item_id" INTEGER,
    "user_id" INTEGER,
    "rev_id" INTEGER,
    "status_id" INTEGER,
    "share" INTEGER NOT NULL,

    PRIMARY KEY ("item_id", "user_id"),
    CONSTRAINT "item_shares_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "item_shares_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "item_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "item_shares_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "item_shares_archive" (
    "item_id" INTEGER,
    "user_id" INTEGER,
    "rev_id" INTEGER,
    "status_id" INTEGER,
    "share" INTEGER NOT NULL,

    PRIMARY KEY ("item_id", "user_id", "rev_id"),
    CONSTRAINT "item_shares_archive_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "item_shares_archive_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "item_shares_archive_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "item_shares_archive_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rev_id" INTEGER,
    "rcpt_id" INTEGER,
    "cat_id" INTEGER,
    "status_id" INTEGER,
    "cost" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "items_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "items_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "items_rcpt_id_fkey" FOREIGN KEY ("rcpt_id") REFERENCES "receipts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "items_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "items_archive" (
    "id" INTEGER,
    "rev_id" INTEGER,
    "rcpt_id" INTEGER,
    "cat_id" INTEGER,
    "status_id" INTEGER,
    "cost" INTEGER NOT NULL,
    "notes" TEXT,

    PRIMARY KEY ("id", "rev_id"),
    CONSTRAINT "items_archive_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "items_archive_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "items_archive_rcpt_id_fkey" FOREIGN KEY ("rcpt_id") REFERENCES "receipts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "items_archive_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "items_archive_id_fkey" FOREIGN KEY ("id") REFERENCES "items" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "memberships" (
    "group_id" INTEGER,
    "user_id" INTEGER,
    "rev_id" INTEGER,
    "admin" INTEGER DEFAULT 0,
    "status_id" INTEGER,
    "default_cat_id" INTEGER,

    PRIMARY KEY ("user_id", "group_id"),
    CONSTRAINT "memberships_default_cat_id_fkey" FOREIGN KEY ("default_cat_id") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "memberships_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "memberships_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "memberships_archive" (
    "group_id" INTEGER,
    "user_id" INTEGER,
    "rev_id" INTEGER,
    "admin" INTEGER,
    "status_id" INTEGER,
    "default_cat_id" INTEGER,

    PRIMARY KEY ("user_id", "group_id", "rev_id"),
    CONSTRAINT "memberships_archive_default_cat_id_fkey" FOREIGN KEY ("default_cat_id") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "memberships_archive_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "memberships_archive_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "memberships_archive_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "memberships_archive_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "migrations" (
    "name" TEXT
);

CREATE TABLE "receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rev_id" INTEGER,
    "status_id" INTEGER,
    "paid_on" INTEGER,
    "paid_by" INTEGER,
    "group_id" INTEGER,
    CONSTRAINT "receipts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "receipts_paid_by_fkey" FOREIGN KEY ("paid_by") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "receipts_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "receipts_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "receipts_archive" (
    "id" INTEGER,
    "rev_id" INTEGER,
    "status_id" INTEGER,
    "paid_on" INTEGER,
    "paid_by" INTEGER,
    "group_id" INTEGER,

    PRIMARY KEY ("id", "rev_id"),
    CONSTRAINT "receipts_archive_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "receipts_archive_paid_by_fkey" FOREIGN KEY ("paid_by") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "receipts_archive_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "receipts_archive_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "receipts_archive_id_fkey" FOREIGN KEY ("id") REFERENCES "receipts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "revisions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rev_on" INTEGER NOT NULL,
    "rev_by" INTEGER,
    CONSTRAINT "revisions_rev_by_fkey" FOREIGN KEY ("rev_by") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE "statuses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL
);

CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rev_id" INTEGER,
    "status_id" INTEGER,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "default_group_id" INTEGER,
    "image" TEXT,
    CONSTRAINT "users_default_group_id_fkey" FOREIGN KEY ("default_group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "users_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "users_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "users_archive" (
    "id" INTEGER,
    "rev_id" INTEGER,
    "status_id" INTEGER,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "default_group_id" INTEGER,
    "image" TEXT,

    PRIMARY KEY ("id", "rev_id"),
    CONSTRAINT "users_archive_default_group_id_fkey" FOREIGN KEY ("default_group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "users_archive_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "users_archive_rev_id_fkey" FOREIGN KEY ("rev_id") REFERENCES "revisions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "users_archive_id_fkey" FOREIGN KEY ("id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_users_1" ON "users"("email");
Pragma writable_schema=0;

CREATE VIEW consumption AS
SELECT
  r.group_id AS groupId,
  r.paid_on AS paidOn,
  r.paid_by AS paidBy,
  COALESCE(sh.user_id, r.paid_by) AS paidTo,
  i.id AS itemId,
  i.cat_id AS catId,
  cost / 100.0 * COALESCE(share * 1.0 / SUM(share) OVER (PARTITION BY i.id), 1) AS share
FROM receipts r
INNER JOIN items i ON r.id = i.rcpt_id
LEFT JOIN item_shares sh ON (sh.item_id = i.id AND sh.status_id = 1)
WHERE r.status_id = 1 AND i.status_id = 1
ORDER BY paid_on;
