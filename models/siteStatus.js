const { sequelize, DataTypes } = require('../config/config');

const SiteStatus = sequelize.define('SiteStatus', {
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

module.exports = { SiteStatus }