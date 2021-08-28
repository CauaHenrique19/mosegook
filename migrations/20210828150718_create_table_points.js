exports.up = function(knex) {
  return knex.schema.createTable('points', table => {
    table.increments('id').primary().notNull()
    table.integer('user_id').references('id').inTable('users').notNull()
    table.integer('quantity').notNull()
    table.string('action_description').notNull()
    table.integer('action_id').notNull()
    table.string('action_table').notNull()
    table.timestamp('created_at').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('points')
};