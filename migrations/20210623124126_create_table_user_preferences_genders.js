exports.up = function(knex) {
  return knex.schema.createTable('user_preferences_genders', table => {
    table.increments('id').primary().notNull()
    table.integer('user_id').references('id').inTable('users').notNull()
    table.integer('gender_id').references('id').inTable('genders').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_preferences_genders')
};
