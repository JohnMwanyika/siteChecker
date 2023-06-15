// const { DataTypes } = require('sequelize')
const { sequelize,DataTypes } = require('../config/config');

const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone:{
        type:DataTypes.BIGINT,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

module.exports = { User };
