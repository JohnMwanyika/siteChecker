const { sequelize } = require('../config/config');
// collect all models from indivual model files
const { User } = require('../models/user.model');
const { UserStatus } = require('../models/userStatus');
const { Website } = require('../models/websites.model');
const { SiteStatus } = require('../models/siteStatus');
const { Role } = require('./role.model');
const { Team } = require('./team.model');
const { Monitor, Monitor_Status } = require('./monitor.model');
const { Results } = require('./results.model');

// define all the associations
UserStatus.hasMany(User, { foreignKey: 'statusId' });
User.belongsTo(UserStatus, { foreignKey: 'statusId' });
// Role
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

User.hasMany(Website, { foreignKey: 'createdBy' });
Website.belongsTo(User, { foreignKey: 'createdBy' });

// site
SiteStatus.hasMany(Website, { foreignKey: 'statusId' });
Website.belongsTo(SiteStatus, { foreignKey: 'statusId' });

// Team.hasMany(User);
Team.belongsToMany(User, { through: 'user_team' });
User.belongsToMany(Team, { through: 'user_team' });
// Monitor to status
Monitor_Status.hasMany(Monitor, { foreignKey: 'statusId' });
Monitor.belongsTo(Monitor_Status, { foreignKey: 'statusId' });

// website to monitor
Website.hasMany(Monitor, { foreignKey: 'siteId' });
Monitor.belongsTo(Website, { foreignKey: 'siteId' });
// user to Monitor
User.hasMany(Monitor, { foreignKey: 'createdBy' });
Monitor.belongsTo(User, { foreignKey: 'createdBy' });
// Team to monitor
Team.hasMany(Monitor, { foreignKey: 'teamId' });
Monitor.belongsTo(Team, { foreignKey: 'teamId' });
// Website to Results
Website.hasMany(Results, { foreignKey: 'siteId' });
Results.belongsTo(Website, { foreignKey: 'siteId' });

console.log(Object.getOwnPropertyNames(Website.prototype));
async function syncDb() {
  await sequelize.sync({ alter: true });
  return 'Database synced successfully';
}

// syncDb()
//   .then(data => console.log(data))
//   .catch(err => console.error(err));

module.exports = { User, UserStatus, Website, SiteStatus, Team, Monitor, Monitor_Status, Results, Role };








//-----------------------------SEEDERS----------------------------------------------- 
async function populateNewDb() {

  try {
    // CREATE DEFAULT ROLES ######################################
    const existingRoles = await Role.findAll({
      where: {
        name: 'Super Admin',
        name: 'Admin'
      }
    })
    if (existingRoles < 1) {
      const newRoles = await Role.bulkCreate([
        { name: 'Super Admin', description: 'Overal system administrator' },
        { name: 'Admin', description: 'Normal system admin' }
      ]);
      if (newRoles) {
        console.log('Roles created successfully')
      }
    }
    console.log('Roles exists')

    // CREATE DEFAULT USER STATUSES ############################
    const existingStatus = await UserStatus.findAll({
      where: {
        status: 'Active',
        status: 'Inactive'
      }
    })
    if (existingStatus < 1) {
      const newStatuses = await UserStatus.bulkCreate([
        { status: 'Active', description: 'This user is active and can log in to the system', color: 'success' },
        { status: 'Inactive', description: 'This user has been deactivated and cannot login to the system', color: 'danger' }
      ]);
      if (newStatuses) {
        console.log('User statuses created successfully')
      }
    }
    console.log('Statuses exists')

    // CREATE SITE STATUSES
    const existingSiteStatuses = await SiteStatus.findAll({
      where: {
        status: 'Not Monitoring',
        status: 'Monitoring'
      }
    })
    if (existingSiteStatuses < 1) {
      const newSiteStatuses = await SiteStatus.bulkCreate([
        { status: 'Not Monitoring', description: 'This site is not being monitored', color: 'secondary' },
        { status: 'Monitoring', description: 'This site is currently being monitored', color: 'info' },
      ])
      if (newSiteStatuses) {
        console.log('SiteStatuses have been created successfully');
      }
    }
    console.log('All site statuses exist');

    // CREATE MONITOR STATUS
    const monitorStatuses = await Monitor_Status.findAll({
      where: {
        name: 'Live',
        name: 'Offline',
      }
    });
    if (monitorStatuses < 1) {
      const newMonStatus = await Monitor_Status.bulkCreate([
        { name: 'Live', description: 'This website/API is active and operational', color: 'success' },
        { name: 'Offline', description: 'This website/API is inactive the respective team has been notified.', color: 'danger' },
      ])

      if (newMonStatus) {
        console.log('Monitoring statuses created succesffuly')
      }
      console.log('Monitoring statuses already exists')
    }
  } catch (error) {
    console.log(error);
  }
}

// populateNewDb()
//   .then(data => console.log(data))
//   .catch(err => console.error(err));