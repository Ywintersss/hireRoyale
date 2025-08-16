'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserEvents', {
            user_id: {
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'User',
                    key: 'user_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                type: Sequelize.UUID
            },
            event_id: {
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'Event',
                    key: 'event_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                type: Sequelize.UUID
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('UserEvents');
    }
};
