
exports.up = function(knex) {
  return knex.raw(`
    alter table users
        add key_image_user varchar(255) not null
  `)
};

exports.down = function(knex) {
  return knex.raw(`
    drop column users
  `)
};
