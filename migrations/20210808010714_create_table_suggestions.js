
exports.up = function(knex) {
  return knex.schema.createTable('suggestions', table => {
    table.increments('id').primary().notNull()
    table.string('media_name').notNull()
    table.integer('user_id').references('id').inTable('users').notNull()
    table.string('status').notNull()
    table.timestamp('created_at').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('suggestions')
};