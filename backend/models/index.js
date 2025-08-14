// const sequelize = require("../config/db");
// const User = require("./User");
// const Ipo = require("./Ipo");
// const Transaction=require("./Transaction");
// const Holding=require("./Holding");

// const db = {
//   sequelize,
//   Sequelize: require("sequelize"),
//   User,
//   Ipo,
//   Transaction,
//   Holding,
// };

// module.exports = db;


const sequelize = require("../config/db");
const { Sequelize } = require("sequelize");

const User = require("./User");
const Ipo = require("./Ipo");
const Transaction = require("./Transaction");
const Holding = require("./Holding");
const PriceHistory = require("./PriceHistory");

const db = {
  sequelize,
  Sequelize,
  User,
  Ipo,
  Transaction,
  Holding,
  PriceHistory
};

// Associations
Ipo.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Ipo, { foreignKey: "userId" });

Transaction.belongsTo(Ipo, { foreignKey: "ipoId" });
Ipo.hasMany(Transaction, { foreignKey: "ipoId" });

Holding.belongsTo(User, { foreignKey: "userEmail", targetKey: "email" });
User.hasMany(Holding, { foreignKey: "userEmail", sourceKey: "email" });

Holding.belongsTo(Ipo, { foreignKey: "ipoId" });
Ipo.hasMany(Holding, { foreignKey: "ipoId" });

PriceHistory.belongsTo(Ipo, { foreignKey: "ipoId" });
Ipo.hasMany(PriceHistory, { foreignKey: "ipoId" });

module.exports = db;
