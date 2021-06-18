
exports.up = function(knex) {
  return knex.schema.createTable('genders', table => {
    table.increments('id').primary().notNull()
    table.string('name').notNull()
    table.string('color').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('genders')
};
