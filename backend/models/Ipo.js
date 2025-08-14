// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Ipo = sequelize.define("Ipo", {
//   ownerName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   contactNo: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   landSize: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   shareCost: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   availableShares: {
//   type: DataTypes.INTEGER,
//   allowNull: false,
// },
// totalShares: {
//   type: DataTypes.INTEGER,
//   allowNull: false,
// },
//   address: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   features: {
//     type: DataTypes.STRING,
//   },
//   aadharUrl: {
//     type: DataTypes.STRING,
//   },
//   landDocUrl: {
//     type: DataTypes.STRING,
//   },
//   signatureUrl: {
//     type: DataTypes.STRING,
//   },
//   photoUrl: {
//     type: DataTypes.STRING,
//   },
//   approved: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   }
// });

// module.exports = Ipo;


const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ipo = sequelize.define("Ipo", {
  ownerName: { type: DataTypes.STRING, allowNull: false },
  contactNo: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  landSize: { type: DataTypes.STRING, allowNull: false },
  shareCost: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, // use DECIMAL for money
  availableShares: { type: DataTypes.INTEGER, allowNull: false },
  totalShares: { type: DataTypes.INTEGER, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  features: { type: DataTypes.STRING },
  aadharUrl: { type: DataTypes.STRING },
  landDocUrl: { type: DataTypes.STRING },
  signatureUrl: { type: DataTypes.STRING },
  photoUrl: { type: DataTypes.STRING },
  approved: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
});

module.exports = Ipo;
