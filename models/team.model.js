const { sequelize, DataTypes } = require('../config/config');

const Team = sequelize.define("Team", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: DataTypes.TEXT
})

module.exports = { Team }