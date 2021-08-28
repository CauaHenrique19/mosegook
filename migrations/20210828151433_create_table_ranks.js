
exports.up = function(knex) {
  return knex.schema.createTable('ranks', table => {
    table.increments('id').primary().notNull()
    table.string('name').notNull()
    table.string('color').notNull()
    table.integer('value_to_enter').notNull()
    table.integer('value_to_up').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('ranks')
};
