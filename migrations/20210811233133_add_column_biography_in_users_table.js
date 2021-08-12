
exports.up = function(knex) {
  return knex.schema.alterTable('users', table => {
      table.string('biography')
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.dropColumn('biography')
  })
};
