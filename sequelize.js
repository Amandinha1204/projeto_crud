const Sequelize = require('sequelize');

const sequelize = new Sequelize('temp', 'aluno_20201214010021', '128407', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5439,
});

module.exports = sequelize;
