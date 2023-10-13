var DataTypes = require("sequelize").DataTypes;
var _Movies = require("./Movies");
var _Users = require("./Users");

function initModels(sequelize) {
  var Movies = _Movies(sequelize, DataTypes);
  var Users = _Users(sequelize, DataTypes);

  Movies.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Movies, { as: "Movies", foreignKey: "user_id"});

  return {
    Movies,
    Users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
