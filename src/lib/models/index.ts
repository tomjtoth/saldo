import { db } from "./db";
import { User } from "./user";
import { Category } from "./category";
import { Receipt } from "./receipt";
import { Item } from "./item";
import { ItemShare } from "./itemShare";
import { Revision } from "./common";
import { Group } from "./group";
import { Membership } from "./membership";

export * from "./db";
export * from "./user";
export * from "./group";
export * from "./membership";
export * from "./category";
export * from "./receipt";
export * from "./item";
export * from "./itemShare";
export { Revision };
export type { TCrRevision } from "./common";

Revision.belongsTo(User, { foreignKey: "revBy" });
User.hasMany(Revision, { foreignKey: "revBy" });

User.belongsTo(Revision, { foreignKey: "revId" });
User.belongsToMany(Group, { through: Membership, foreignKey: "userId" });
User.hasMany(Membership, { foreignKey: "userId" });
User.hasMany(Receipt, { foreignKey: "paidBy" });
User.hasMany(ItemShare, { foreignKey: "userId" });

Group.belongsTo(Revision, { foreignKey: "revId" });
Group.belongsToMany(User, { through: Membership, foreignKey: "groupId" });
Group.hasMany(Membership, { foreignKey: "groupId" });
Group.hasMany(Category, { foreignKey: "groupId" });
Group.hasMany(Receipt, { foreignKey: "groupId" });

Category.belongsTo(Revision, { foreignKey: "revId" });
Category.belongsTo(Group, { foreignKey: "groupId" });
Category.hasMany(Item, { foreignKey: "catId" });

Receipt.belongsTo(Revision, { foreignKey: "revId" });
Receipt.belongsTo(User, { foreignKey: "paidBy" });
Receipt.hasMany(Item, { foreignKey: "rcptId" });

Item.belongsTo(Revision, { foreignKey: "revId" });
Item.belongsTo(Receipt, { foreignKey: "rcptId" });
Item.belongsTo(Category, { foreignKey: "catId" });
Item.hasMany(ItemShare, { foreignKey: "itemId", as: "shares" });

ItemShare.belongsTo(Item, { foreignKey: "itemId" });
ItemShare.belongsTo(User, { foreignKey: "userId" });
ItemShare.belongsTo(Revision, { foreignKey: "revId" });

export const syncDb = async () =>
  await db.sync({ force: true, match: /^:memory:$/ });
