const { sequelize, DataTypes } = require('../config/config');

const Member = sequelize.define('Member', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

module.exports = { Member };