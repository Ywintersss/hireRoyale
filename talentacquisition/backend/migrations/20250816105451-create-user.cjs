'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            user_id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID
            },
            role_id: {
                references: {
                    model: 'Role',
                    key: 'role_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                type: Sequelize.UUID
            },
            resume_id: {
                type: Sequelize.UUID
            },
            user_name: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            contact: {
                type: Sequelize.STRING
            },
            password: {
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
        await queryInterface.dropTable('Users');
    }
};
