const { sequelize, DataTypes } = require('../config/config');

const Team = sequelize.define("Team", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'name'
    },
    description: DataTypes.TEXT
})

async function createDefaultTeam() {
    try {
        const isExisting = await Team.findOne({ where: { name: 'Default' } });
        if (isExisting) {
            return console.log(`Default team already exists! ,teamId is ${isExisting.id}`)
        } else {
            const defaultTeam = await Team.create({ name: 'Default', description: 'This is a default team created by the system and cannot be deleted ,members added in this team will all receive notifications' });
            return console.log(`Default Team created successfully! ,teamId is ${defaultTeam.id}`)
        }

    } catch (error) {
        console.log('Error creating Default Team: ' + error.message)
    }
}
createDefaultTeam()
    .then(result => console.log(result))
    .catch(error => console.log(error));

module.exports = { Team }