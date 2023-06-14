require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.CONN_STRING);

const authenticate = async () => {
    await sequelize.authenticate();
    return 'Connection has been established successfully.';
}

authenticate()
    .then((data) => console.log(data))
    .catch(error => console.log('unable to connect to Database,', error.message));

module.exports = { sequelize, DataTypes };