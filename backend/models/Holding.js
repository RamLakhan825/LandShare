// // models/Holding.js
// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Holding = sequelize.define("Holding", {
//   ipoId: { type: DataTypes.INTEGER, allowNull: false },
//   userEmail: { type: DataTypes.STRING, allowNull: false },
//   shares: { type: DataTypes.INTEGER, defaultValue: 0 },
//   purchasePrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }, // NEW
// }, {
//   timestamps: true,
//   updatedAt: "updated_at",
//   createdAt: false
// });

// module.exports = Holding;


const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Holding = sequelize.define("Holding", {
  ipoId: { type: DataTypes.INTEGER, allowNull: false },
  userEmail: { type: DataTypes.STRING, allowNull: false },
  shares: { type: DataTypes.INTEGER, defaultValue: 0 },
  purchasePrice: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
}, {
  timestamps: true,
  updatedAt: "updated_at",
  createdAt: false
});

module.exports = Holding;
