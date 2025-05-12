import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface EventAttributes {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  createdBy: number;
  deletedAt: Date | null;
}

type EventCreationAttributes = Optional<
  EventAttributes,
  'id' | 'description' | 'deletedAt'
>;

class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  declare id: number;
  declare title: string;
  declare description: string | null;
  declare date: Date;
  declare createdBy: number;
  declare deletedAt: Date | null;

  static associate(models: { User: typeof import('./User').default }) {
    Event.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
  }
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: false,
    paranoid: true,
    defaultScope: {
      where: { deletedAt: null },
    },
  },
);

export default Event;
