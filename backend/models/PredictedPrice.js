const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PredictedPrice = sequelize.define("PredictedPrice", {
  ipoId: { type: DataTypes.INTEGER, allowNull: false },
  predictedClose: { type: DataTypes.DECIMAL(12,2), allowNull: false },
}, {
  timestamps: true,
});

module.exports = PredictedPrice;
