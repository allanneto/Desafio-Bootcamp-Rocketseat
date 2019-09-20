module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('meetups', 'canceled_at');
  },

  down: queryInterface => {
    return queryInterface.dropTable('users');
  },
};
