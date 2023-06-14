const { sequelize, DataTypes } = require('../config/config');

const UserStatus = sequelize.define('UserStatus', {
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

module.exports = { UserStatus }