'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
    class RolePermission extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    RolePermission.init({
        role_id: DataTypes.UUID,
        permission_id: DataTypes.UUID
    }, {
        sequelize,
        timestamps: false,
        modelName: 'RolePermission',
    });
    return RolePermission;
};
