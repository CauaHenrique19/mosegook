
exports.up = function(knex) {
  return knex.schema.createTable('medias', table => {
    table.increments('id').primary().notNull()
    table.string('name').notNull()
    table.text('synopsis').notNull()
    table.integer('category_id').references('id').inTable('categories').notNull()
    table.float('avaliation').notNull()
    table.string('key_poster').notNull()
    table.string('url_poster').notNull()
    table.string('key_poster_timeline').notNull()
    table.string('url_poster_timeline').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('medias')
};
