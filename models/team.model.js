const { sequelize, DataTypes } = require('../config/config');
const { User } = require('./user.model');

const Team = sequelize.define("Team", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: DataTypes.TEXT,
    createdBy: DataTypes.INTEGER,
    email: {
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '0'
    },
    sms:{
        type: DataTypes.ENUM('1', '0'),
        defaultValue: '0'
    }
})

async function createDefaultTeam(createdBy) {
    try {
        const isExisting = await Team.findOne({ where: { name: 'Default', createdBy: createdBy }, include: [{ model: User }] });

        if (isExisting) {
            const { lastName } = await isExisting.getUser()
            return console.log(`Default team already exists! ,teamId is ${isExisting.id}, owner is ${lastName}`)
        } else {
            const defaultTeam = await Team.create({ name: 'Default', description: 'This is a default team created by the system and cannot be deleted ,members added here this team will all receive notifications', createdBy });
            const team = await Team.findByPk(defaultTeam.id, { include: [{ model: User }] });
            const { lastName } = await team.getUser()
            return console.log(`Default Team created successfully! ,teamId is ${defaultTeam.id} ownerId is ${lastName}`)
        }

    } catch (error) {
        console.log('Error creating Default Team: ' + error.message)
    }
}
// createDefaultTeam(1)
//     .then(result => console.log(result))
//     .catch(error => console.log(error));

module.exports = { Team, createDefaultTeam }