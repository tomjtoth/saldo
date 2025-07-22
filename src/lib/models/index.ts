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
Users.have(Revisions.via("revisedBy"), "created");

Users.column("revisionId").joinsTo(Revisions);
Users.have(Memberships);
Users.have(Groups.through(Memberships));

Groups.have(Categories);
Groups.have(Memberships);
Groups.have(Receipts);
Groups.have(Users.through(Memberships));

Receipts.have(Items);

Categories.column("groupId").joinsTo(Groups);
Items.have(ItemShares);
