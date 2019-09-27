import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        creator_id: Sequelize.INTEGER,
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        localization: Sequelize.STRING,
        date: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
          cancelable: {
            type: Sequelize.VIRTUAL,
            get() {
              return isBefore(new Date(), subHours(this.date, 3));
            },
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.Subscription, { foreignKey: 'meetup_id' });
    this.belongsTo(models.Banner, { foreignKey: 'banner_id', as: 'banner' });
    this.belongsTo(models.User, { foreignKey: 'creator_id', as: 'user' });
  }
}

export default Meetup;
