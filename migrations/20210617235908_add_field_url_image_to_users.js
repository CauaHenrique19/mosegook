
exports.up = function(knex) {
    return knex.raw(`
      alter table users
          add url_image varchar(255) not null
    `)
  };
  
  exports.down = function(knex) {
    return knex.raw(`
      drop column url_image
    `)
  };
  