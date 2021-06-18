// Update with your config settings.

module.exports = {
  /*
  client: 'pg',
  connection: {
    host: 'ec2-54-164-241-193.compute-1.amazonaws.com',
    database: 'd68vinefp82nsr',
    user: 'gvclarjnfymigb',
    password: 'a7b8c21a2378e0871aafc570f26e468cb29fbee57eec9a6a3f7661eb64470002',
    ssl: {
      rejectUnauthorized: false
    }
  },
  migrations: {
    tableName: 'knex_migrations'
  }
  */
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
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
