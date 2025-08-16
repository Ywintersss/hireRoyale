'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('RolePermissions', {
            role_id: {
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'Role',
                    key: 'role_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                type: Sequelize.UUID
            },
            permission_id: {
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'Permission',
                    key: 'permission_id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                type: Sequelize.UUID
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('RolePermissions');
    }
};
