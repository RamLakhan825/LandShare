

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PriceHistory = sequelize.define("PriceHistory", {
  ipoId: { type: DataTypes.INTEGER, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  open: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  high: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  low: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  close: { type: DataTypes.DECIMAL(12,2), allowNull: false },
}, {
  timestamps: true
});

module.exports = PriceHistory;
