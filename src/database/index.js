import Sequelize from 'sequelize';

import User from '../app/models/user';
import Banner from '../app/models/banner';
import Meetup from '../app/models/meetup';

import databaseConfig from '../config/database';

const models = [User, Banner, Meetup];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
