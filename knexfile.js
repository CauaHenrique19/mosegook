// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'mosegook',
      user:     'postgres',
      password: process.env.PASSWORD_DB
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
