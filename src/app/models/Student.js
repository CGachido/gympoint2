import Sequelize, { Model } from 'sequelize';

class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        age: Sequelize.DECIMAL,
        weight: Sequelize.DECIMAL,
        height: Sequelize.DECIMAL,
      },
      { sequelize }
    );
  }
}

export default Student;
