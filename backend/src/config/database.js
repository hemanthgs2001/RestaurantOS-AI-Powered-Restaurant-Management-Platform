// const { Sequelize } = require('sequelize');
// const dotenv = require('dotenv');

// dotenv.config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres',
//     logging: process.env.NODE_ENV === 'development' ? console.log : false,
//     pool: {
//       max: 10,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//   }
// );

// const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('PostgreSQL connected successfully');
    
//     // Sync models in development
//     if (process.env.NODE_ENV === 'development') {
//       await sequelize.sync({ alter: true });
//       console.log('Models synchronized');
//     }
//   } catch (error) {
//     console.error('Unable to connect to database:', error);
//     process.exit(1);
//   }
// };

// module.exports = { sequelize, connectDB };


const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Most hosted Postgres providers (Render Postgres, Supabase, Neon, ElephantSQL, etc.)
// require SSL connections. Locally you usually don't need it, so we only
// enable it when NODE_ENV is production OR when explicitly requested.
const useSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false, // needed for most managed Postgres providers' self-signed certs
          },
        }
      : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');

    // IMPORTANT: sequelize.sync() previously only ran when NODE_ENV === 'development'.
    // On Render, NODE_ENV is typically 'production', so your tables were
    // never being created/updated there. Running sync() here (with alter:true)
    // ensures your production tables match your models on every deploy.
    // Once your schema is stable, consider switching to proper migrations
    // instead of sync({ alter: true }) in production.
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };