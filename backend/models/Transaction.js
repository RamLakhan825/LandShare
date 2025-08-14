// // models/Transaction.js
// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Transaction = sequelize.define("Transaction", {
//   ipoId: { type: DataTypes.INTEGER, allowNull: false },
//   buyerEmail: { type: DataTypes.STRING, allowNull: true },
//   sellerEmail: { type: DataTypes.STRING },
//   shares: { type: DataTypes.INTEGER, allowNull: false },
//   pricePerShare: { type: DataTypes.DECIMAL(12,2), allowNull: false },
//   totalAmount: { type: DataTypes.DECIMAL(14,2), allowNull: false },
//   adminFee: { type: DataTypes.DECIMAL(14,2), allowNull: false },
//   paymentId: { type: DataTypes.STRING },
//   status: { type: DataTypes.ENUM("pending","completed","failed"), defaultValue: "pending" }
// }, {
//   timestamps: true,
//   createdAt: "createdAt",
//   updatedAt: false
// });

// module.exports = Transaction;


const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Transaction = sequelize.define("Transaction", {
  ipoId: { type: DataTypes.INTEGER, allowNull: false },
  buyerEmail: { type: DataTypes.STRING },
  sellerEmail: { type: DataTypes.STRING },
  shares: { type: DataTypes.INTEGER, allowNull: false },
  pricePerShare: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(14,2), allowNull: false },
  adminFee: { type: DataTypes.DECIMAL(14,2), allowNull: false },
  paymentId: { type: DataTypes.STRING },
  status: { 
    type: DataTypes.ENUM("pending","completed","failed"), 
    defaultValue: "pending" 
  }
}, {
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: false
});

module.exports = Transaction;
