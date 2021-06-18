
exports.up = function(knex) {
  return knex.schema.createTable('genders_in_medias', table => {
      table.increments('id').primary().notNull()
      table.integer('media_id').references('id').inTable('medias').notNull()
      table.integer('gender_id').references('id').inTable('genders').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('genders_in_medias')
};