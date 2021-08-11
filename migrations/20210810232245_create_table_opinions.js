exports.up = function(knex) {
  return knex.schema.createTable('opinions', table => {
    table.increments('id').primary().notNull()
    table.string('content').notNull()
    table.integer('user_id').references('id').inTable('users').notNull()
    table.timestamp('created_at').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('opinions')
};