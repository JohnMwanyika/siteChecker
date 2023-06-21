const { sequelize, DataTypes } = require('../config/config');

const Monitor = sequelize.define('Monitor', {
    siteId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    interval: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    statusId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

const Monitor_Status = sequelize.define('Monitor_Status', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: DataTypes.TEXT,
    color: DataTypes.STRING
})

module.exports = { Monitor, Monitor_Status };