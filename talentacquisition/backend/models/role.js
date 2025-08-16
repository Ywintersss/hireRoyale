'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
    class Role extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Role.hasMany(models.User, {
                foreignKey: 'role_id',
                as: 'users'
            })
            Role.belongsToMany(models.Permission, { through: 'RolePermission' })
        }
    }
    Role.init({
        role_id: DataTypes.UUID,
        role_name: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Role',
    });
    return Role;
};
