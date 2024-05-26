// config/database.js
import { config } from 'dotenv';
import { Sequelize } from 'sequelize';
config();

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: process.env.PGDATABASE, // Replace with your database name
    username: process.env.PGUSER, // Replace with your database username
    password: process.env.PGPASSWORD, // Replace with your database password
    host: process.env.PGHOST,
    port: 5432,
    logging: false, // Disable logging to console
    define: {
        freezeTableName: true, // disable pluralization
    }
});

export default sequelize;