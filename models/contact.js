import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    linkedId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Contact', 
            key: 'id'
        }
    },
    linkPrecedence: {
        type: DataTypes.ENUM('primary', 'secondary'),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Contact',
    paranoid: true // Enables the soft deletion with deletedAt
});

async function syncModels() {
    try {
        // Check if the Contact table exists
        const tableExists = await sequelize.getQueryInterface().showAllTables();
        if (!tableExists.includes('Contact')) {
            // If the table doesn't exist, create it
            await Contact.sync();
            console.log('Contact table created successfully');
        } else {
            console.log('Contact table already exists');
        }
    } catch (error) {
        console.error('Error syncing models:', error);
    }
}

// Call the syncModels function to sync the models with the database
syncModels();

export default Contact;
