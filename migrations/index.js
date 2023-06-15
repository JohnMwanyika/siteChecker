const { sequelize } = require('../config/config');
// collect all models from indivual model files
const { User } = require('../models/user.model');
const { UserStatus } = require('../models/userStatus');
const { Website } = require('../models/websites.model');
const { SiteStatus } = require('../models/siteStatus');

// define all the associations
UserStatus.hasMany(User, { foreignKey: 'statusId' });
User.belongsTo(UserStatus, { foreignKey: 'statusId' });

User.hasMany(Website, { foreignKey: 'createdBy' });
Website.belongsTo(User, { foreignKey: 'createdBy' });

// site
SiteStatus.hasMany(Website, { foreignKey: 'statusId' });
Website.belongsTo(SiteStatus, { foreignKey: 'statusId' });


async function syncDb() {
  await sequelize.sync({ alter: true });
  return 'Database synced successfully';
}

// syncDb()
//   .then(data => console.log(data))
//   .catch(err => console.error(err));

module.exports = { User, UserStatus }