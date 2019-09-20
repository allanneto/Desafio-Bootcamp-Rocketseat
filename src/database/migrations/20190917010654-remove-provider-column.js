module.exports = {
  up: queryInterface => {
    // é assim que voce deleta uma coluna quando voce faz merda e cria ela errado!!
    return queryInterface.removeColumn('users', 'provider');
  },

  down: queryInterface => {
    return queryInterface.dropTable('users');
  },
};
