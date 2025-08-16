'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.hasOne(models.Role, {
                foreignKey: 'role_id',
                as: 'role'
            })
            User.belongsToMany(models.Event, { through: 'UserEvent' })
        }
    }
    User.init({
        user_id: DataTypes.UUID,
        role_id: DataTypes.UUID,
        resume_id: DataTypes.UUID,
        user_name: DataTypes.STRING,
        email: DataTypes.STRING,
        contact: DataTypes.STRING,
        password: DataTypes.STRING,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};
