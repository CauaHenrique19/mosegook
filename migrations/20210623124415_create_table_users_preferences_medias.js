
exports.up = function(knex) {
  return knex.schema.createTable('user_preferences_medias', table => {
      table.increments('id').primary().notNull()
      table.integer('user_id').references('id').inTable('users').notNull()
      table.integer('media_id').references('id').inTable('users').notNull()
  })
};

exports.down = function(knex) {
  knex.schema.dropTable('user_preferences_medias')
};
