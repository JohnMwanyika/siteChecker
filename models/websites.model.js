const { sequelize, DataTypes } = require('../config/config');

const Website = sequelize.define('Website', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    organization:DataTypes.STRING
},)

module.exports = { Website }