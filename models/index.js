require('dotenv').config(); // Load environment variables

const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Item = require('./item.js')(sequelize, Sequelize);
db.Category = require('./category.js')(sequelize, Sequelize);

module.exports = db;
