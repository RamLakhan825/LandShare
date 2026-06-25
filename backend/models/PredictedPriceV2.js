const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PredictedPriceV2 = sequelize.define(
  "PredictedPriceV2",
  {
    ipoId: { type: DataTypes.INTEGER, allowNull: false },
    predictedClose: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  },
  {
    timestamps: true,
  }
);

module.exports = PredictedPriceV2;
