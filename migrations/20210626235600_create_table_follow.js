
exports.up = function(knex) {
  return knex.schema.createTable('follow', table => {
    table.increments('id').primary().notNull()
    table.integer('user_id').references('id').inTable('users').notNull()
    table.integer('following_user_id').references('id').inTable('users').notNull()
    table.timestamp('created_at').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('follow')
};
