'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Events', {
            event_id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID
            },
            user_id: {
                references: {
                    model: 'User',
                    key: 'user_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                type: Sequelize.UUID
            },
            event_name: {
                type: Sequelize.STRING
            },
            event_description: {
                type: Sequelize.STRING
            },
            event_datetime: {
                type: Sequelize.DATE
            },
            event_requirements: {
                type: Sequelize.STRING
            },
            event_status: {
                type: Sequelize.ENUM("Pending", "Active", "Upcoming", "Completed", "Cancelled"),
                defaultValue: "Pending"
            },
            event_max_participants: {
                type: Sequelize.INTEGER
            },
            event_industry: {
                type: Sequelize.STRING
            },
            event_level: {
                type: Sequelize.ENUM("Entry", "Intermediate", "Senior"),
                allowNull: false
            },
            event_image_url: {
                type: Sequelize.STRING
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Events');
    }
};
