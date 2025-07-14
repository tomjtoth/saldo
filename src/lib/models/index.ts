import { Categories } from "./category";
import { Groups } from "./group";
import { Items } from "./item";
import { ItemShares } from "./itemShare";
import { Memberships } from "./membership";
import { Receipts } from "./receipt";
import { Revisions } from "./revision";
import { Users } from "./user";

export * from "./revision";
export * from "./user";
export * from "./group";
export * from "./membership";
export * from "./category";
export * from "./receipt";
export * from "./item";
export * from "./itemShare";

Revisions.column("revisedBy").joinsTo(Users);

Users.have(Revisions.via("revisedBy"));
Users.column("revisionId").joinsTo(Revisions);
Users.have(Memberships.via("userId"));

Groups.have(Categories.via("groupId"));
Groups.have(Memberships.via("groupId"));
Groups.have(Receipts.via("groupId"));

Groups.have(Users.through(Memberships));

Categories.joinTo(Groups);
Items.joinTo(ItemShares.via("itemId"));

Users.joinTo(Groups.through(Memberships));
