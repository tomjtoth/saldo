
-- this is to store `0ffffff` the 1st char represents the dashed/solid lineType
ALTER TABLE users ADD COLUMN chart_style TEXT;

-- this is to store identical values in the form of `{ [userId: number]: string }`
-- the overhead of string JSON should be small
ALTER TABLE memberships ADD COLUMN chart_style TEXT;

-- DOWN --

ALTER TABLE users DROP COLUMN chart_style;
ALTER TABLE memberships DROP COLUMN chart_style;
