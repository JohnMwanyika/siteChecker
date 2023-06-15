const { sequelize } = require('../config/config');
// collect all models from indivual model files
const { User } = require('../models/user.model');
const { UserStatus } = require('../models/userStatus');
const { Website } = require('../models/websites.model');
const { SiteStatus } = require('../models/siteStatus');
const { Role } = require('./role.model')

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

// Role


async function syncDb() {
  await sequelize.sync({ alter: true });
  return 'Database synced successfully';
}

// syncDb()
//   .then(data => console.log(data))
//   .catch(err => console.error(err));

module.exports = { User, UserStatus, Website, SiteStatus };