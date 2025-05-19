import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/db';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  loginHistory: Array<{ ip: string; userAgent: string; date: Date }>;
  createdAt: Date;
  deletedAt: Date | null;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'loginHistory' | 'createdAt' | 'deletedAt'
>;

// Основной класс модели
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare loginHistory: Array<{ ip: string; userAgent: string; date: Date }>;
  declare createdAt: Date;
  declare deletedAt: Date | null;

  static associate(models: { 
    Event: typeof import('./Event').default;
    EventParticipant: typeof import('./EventParticipant').default;
  }) {
    User.hasMany(models.Event, {
      foreignKey: 'createdBy',
      as: 'createdEvents',
    });
    
    User.hasMany(models.EventParticipant, {
      foreignKey: 'userId',
      as: 'participations',
    });
  }

  public comparePassword(candidatePassword: string): boolean {
    const password = this.getDataValue('password');
    if (!candidatePassword || !password) return false;
    return bcrypt.compareSync(candidatePassword, password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      set(value: string) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(value, salt);
        this.setDataValue('password', hash);
      },
    },
    loginHistory: {
      type: DataTypes.JSONB,
      defaultValue: [],
      get() {
        return this.getDataValue('loginHistory') || [];
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
    paranoid: true,
    defaultScope: {
      where: { deletedAt: null },
      attributes: { exclude: ['password', 'loginHistory'] },
    },
  },
);

export default User;
