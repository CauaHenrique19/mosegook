
exports.up = function(knex) {
  return knex.schema.createTable('avaliations', table => {
    table.increments('id').primary().notNull()
    table.integer('user_id').references('id').inTable('users').notNull()
    table.integer('media_id').references('id').inTable('medias').notNull()
    table.text('content').notNull()
    table.timestamp('created_at').notNull()
    table.float('stars').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('avaliations')
};
