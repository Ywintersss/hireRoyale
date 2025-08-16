'use strict';
import { Model } from 'sequelize';


export default (sequelize, DataTypes) => {
    const eventStatus = ["Pending", "Active", "Upcoming", "Completed", "Cancelled"]
    const eventLevels = ["Entry", "Intermediate", 'Senior']
    class Event extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Event.belongsToMany(models.User, { through: 'UserEvent' })
        }
    }
    Event.init({
        event_id: DataTypes.UUID,
        user_id: DataTypes.UUID,
        event_name: DataTypes.STRING,
        event_description: DataTypes.STRING,
        event_datetime: DataTypes.DATE,
        event_requirements: DataTypes.STRING,
        event_status: {
            type: DataTypes.ENUM,
            values: eventStatus,
            defaultValue: "Pending"
        },
        event_max_participants: DataTypes.INTEGER,
        event_industry: DataTypes.STRING,
        event_level: {
            type: DataTypes.ENUM,
            values: eventLevels,
            allowNull: false
        },
        event_image_url: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Event',
    });
    return Event;
};
