import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/db';

interface EventParticipantAttributes {
  id: number;
  eventId: number;
  userId: number;
  createdAt: Date;
}

type EventParticipantCreationAttributes = Optional<EventParticipantAttributes, 'id' | 'createdAt'>;

class EventParticipant
  extends Model<EventParticipantAttributes, EventParticipantCreationAttributes>
  implements EventParticipantAttributes
{
  declare id: number;
  declare eventId: number;
  declare userId: number;
  declare createdAt: Date;

  static associate(models: {
    Event: typeof import('./Event').default;
    User: typeof import('./User').default;
  }) {
    EventParticipant.belongsTo(models.Event, {
      foreignKey: 'eventId',
      as: 'event',
    });
    
    EventParticipant.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

EventParticipant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'event_participants',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['eventId', 'userId'],
      },
    ],
  },
);

export default EventParticipant;