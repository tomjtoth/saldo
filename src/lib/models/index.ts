import { DataTypes, Model } from "sequelize";

import { db } from "./db";
import { User } from "./user";
import { Category } from "./category";
import { Receipt } from "./receipt";
import { Item } from "./item";
import { ItemShare } from "./item_share";
import { Revision, Status } from "./common";

export * from "./db";
export * from "./user";
export * from "./category";
export * from "./receipt";
export * from "./item";
export * from "./item_share";
export { Revision };
export type { TCrRevision } from "./common";

export class UserSession extends Model {}
UserSession.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    statusId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      references: { model: "statuses", key: "id" },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" },
    },
    ipv4: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize: db, tableName: "user_sessions", timestamps: false }
);

// --- Associations ---
// TODO: check all these

Revision.belongsTo(User, { foreignKey: "revBy" });
User.hasMany(Revision, { foreignKey: "revBy" });

User.belongsTo(Revision, { foreignKey: "revId" });
User.belongsTo(Status, { foreignKey: "statusId" });
User.hasMany(UserSession, { foreignKey: "userId" });
User.hasMany(Receipt, { foreignKey: "paidBy" });
User.hasMany(ItemShare, { foreignKey: "userId" });

UserSession.belongsTo(User, { foreignKey: "userId" });

Category.belongsTo(Revision, { foreignKey: "revId" });
Category.belongsTo(Status, { foreignKey: "statusId" });
Category.hasMany(Item, { foreignKey: "catId" });

Receipt.belongsTo(Revision, { foreignKey: "revId" });
Receipt.belongsTo(Status, { foreignKey: "statusId" });
Receipt.belongsTo(User, { foreignKey: "paidBy" });
Receipt.hasMany(Item, { foreignKey: "rcptId" });

Item.belongsTo(Revision, { foreignKey: "revId" });
Item.belongsTo(Status, { foreignKey: "statusId" });
Item.belongsTo(Receipt, { foreignKey: "rcptId" });
Item.belongsTo(Category, { foreignKey: "catId" });
Item.hasMany(ItemShare, { foreignKey: "itemId" });

ItemShare.belongsTo(Item, { foreignKey: "itemId" });
ItemShare.belongsTo(User, { foreignKey: "userId" });
ItemShare.belongsTo(Revision, { foreignKey: "revId" });
ItemShare.belongsTo(Status, { foreignKey: "statusId" });
