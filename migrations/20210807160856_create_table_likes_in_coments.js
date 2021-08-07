
exports.up = function(knex) {
  return knex.schema.createTable('likes_in_coments', table => {
    table.increments('id').notNull().primary()
    table.integer('user_id').references('id').inTable('users').notNull()
    table.integer('coment_id').references('id').inTable('coments').notNull()
    table.timestamp('created_at').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('likes_in_coments')
};
