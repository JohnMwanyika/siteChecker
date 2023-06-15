const { sequelize, DataTypes } = require('../config/config');

const Role = sequelize.define('Role', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: DataTypes.TEXT,
    color: DataTypes.STRING
})

module.exports = { Role }