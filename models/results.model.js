const { sequelize, DataTypes } = require('../config/config');

const Results = sequelize.define('Results', {
    type: {
        type: DataTypes.ENUM('Up', 'Down', 'Timeout')
    },
    siteId: DataTypes.INTEGER
})

module.exports = { Results };