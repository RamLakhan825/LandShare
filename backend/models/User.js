// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const User = sequelize.define("User", {
//   name: { type: DataTypes.STRING, allowNull: false },
//   email: { type: DataTypes.STRING, allowNull: false, unique: true },
//   password: { type: DataTypes.STRING }, // null for Google users
//   isGoogleUser: { type: DataTypes.BOOLEAN, defaultValue: false },
// });

// module.exports = User;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING }, // null for Google users
  isGoogleUser: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,  // enables createdAt and updatedAt
});

module.exports = User;
