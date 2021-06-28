
exports.up = function(knex) {
  return knex.schema.createTable('coments', table => {
    table.increments('id').primary().notNull()
    table.integer('user_id').references('id').inTable('users').notNull()
    table.integer('avaliation_id').references('id').inTable('avaliations').notNull()
    table.text('content').notNull()
    table.timestamp('created_at').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('coments')
};
