const { sequelize } = require('../config/config');
// collect all models from indivual model files
const { User } = require('../models/user.model');
const { UserStatus } = require('../models/userStatus');
const { Website } = require('../models/websites.model');
const { SiteStatus } = require('../models/siteStatus');
const { Role } = require('./role.model');
const { Team } = require('./team.model');
const { Monitor, Monitor_Status } = require('./monitor.model');

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
User.belongsToMany(Team,{through:'user_team'});
// Monitor to status
Monitor_Status.hasMany(Monitor,{foreignKey: 'statusId'});
Monitor.belongsTo(Monitor_Status,{foreignKey: 'statusId'});

// website to monitor
Website.hasMany(Monitor,{foreignKey: 'siteId'});
Monitor.belongsTo(Website,{foreignKey: 'siteId'});
// user to Monitor
User.hasMany(Monitor,{foreignKey: 'createdBy'});
Monitor.belongsTo(User,{foreignKey: 'createdBy'});
// Team to monitor
Team.hasMany(Monitor,{foreignKey: 'teamId'});
Monitor.belongsTo(Team,{foreignKey: 'teamId'});

console.log(Object.getOwnPropertyNames(Team.prototype))
async function syncDb() {
  await sequelize.sync({ alter: true });
  return 'Database synced successfully';
}

// syncDb()
//   .then(data => console.log(data))
//   .catch(err => console.error(err));

module.exports = { User, UserStatus, Website, SiteStatus, Team, Monitor, Monitor_Status };