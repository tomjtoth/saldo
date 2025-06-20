import { User, UserArchive } from "./user";
import { Category, CategoryArchive } from "./category";
import { Receipt, ReceiptArchive } from "./receipt";
import { Item } from "./item";
import { ItemShare, ItemShareArchive } from "./item_share";
import { Revision, Status } from "./common";
import { Group, GroupArchive } from "./group";
import { Membership } from "./membership";

export * from "./db";
export * from "./user";
export * from "./group";
export * from "./membership";
export * from "./category";
export * from "./receipt";
export * from "./item";
export * from "./item_share";
export { Revision, Status };
export type { TCrRevision, TStatus } from "./common";

// TODO: check these thoroughly

Revision.belongsTo(User, { foreignKey: "revBy" });
User.hasMany(Revision, { foreignKey: "revBy" });

User.belongsTo(Revision, { foreignKey: "revId" });
User.belongsTo(Status, { foreignKey: "statusId" });
User.belongsToMany(Group, { through: Membership, foreignKey: "userId" });
User.hasMany(Membership, { foreignKey: "userId" });
User.hasMany(Receipt, { foreignKey: "paidBy" });
User.hasMany(ItemShare, { foreignKey: "userId" });
User.hasMany(UserArchive, { foreignKey: "id", as: "archives" });

UserArchive.belongsTo(User, { foreignKey: "id", as: "current" });
UserArchive.belongsTo(Revision, { foreignKey: "revId" });
UserArchive.belongsTo(Status, { foreignKey: "statusId" });
UserArchive.hasMany(Receipt, { foreignKey: "paidBy" });
UserArchive.hasMany(ItemShare, { foreignKey: "userId" });

Group.belongsTo(Revision, { foreignKey: "revId" });
Group.belongsToMany(User, { through: Membership, foreignKey: "groupId" });
Group.hasMany(Membership, { foreignKey: "groupId" });
Group.hasMany(Category, { foreignKey: "groupId" });
Group.hasMany(GroupArchive, { foreignKey: "id" });
Group.hasMany(Receipt, { foreignKey: "groupId" });

GroupArchive.belongsTo(Revision, { foreignKey: "revId" });
GroupArchive.belongsTo(Group, { foreignKey: "id" });

Category.belongsTo(Revision, { foreignKey: "revId" });
Category.belongsTo(Status, { foreignKey: "statusId" });
Category.belongsTo(Group, { foreignKey: "groupId" });
Category.hasMany(Item, { foreignKey: "catId" });
Category.hasMany(CategoryArchive, { foreignKey: "id", as: "archives" });

CategoryArchive.belongsTo(Category, { foreignKey: "id", as: "current" });
CategoryArchive.belongsTo(Revision, { foreignKey: "revId" });
CategoryArchive.belongsTo(Status, { foreignKey: "statusId" });
CategoryArchive.hasMany(Item, { foreignKey: "catId" });

Receipt.belongsTo(Revision, { foreignKey: "revId" });
Receipt.belongsTo(Status, { foreignKey: "statusId" });
Receipt.belongsTo(User, { foreignKey: "paidBy" });
Receipt.hasMany(Item, { foreignKey: "rcptId" });
Receipt.hasMany(ReceiptArchive, { foreignKey: "id", as: "archives" });

ReceiptArchive.belongsTo(Receipt, { foreignKey: "id", as: "current" });
ReceiptArchive.belongsTo(Revision, { foreignKey: "revId" });
ReceiptArchive.belongsTo(Status, { foreignKey: "statusId" });
ReceiptArchive.belongsTo(User, { foreignKey: "paidBy" });
ReceiptArchive.hasMany(Item, { foreignKey: "rcptId" });

Item.belongsTo(Revision, { foreignKey: "revId" });
Item.belongsTo(Status, { foreignKey: "statusId" });
Item.belongsTo(Receipt, { foreignKey: "rcptId" });
Item.belongsTo(Category, { foreignKey: "catId" });
Item.hasMany(ItemShare, { foreignKey: "itemId", as: "shares" });

ItemShare.belongsTo(Item, { foreignKey: "itemId" });
ItemShare.belongsTo(User, { foreignKey: "userId" });
ItemShare.belongsTo(Revision, { foreignKey: "revId" });
ItemShare.belongsTo(Status, { foreignKey: "statusId" });
ItemShare.hasMany(ItemShareArchive, { foreignKey: "itemId", as: "archives" });

ItemShareArchive.belongsTo(Item, { as: "current" });
ItemShareArchive.belongsTo(User, { foreignKey: "userId" });
ItemShareArchive.belongsTo(Revision, { foreignKey: "revId" });
ItemShareArchive.belongsTo(Status, { foreignKey: "statusId" });
