// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'mosegook',
      user:     'postgres',
      password: 'caua987311363'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
