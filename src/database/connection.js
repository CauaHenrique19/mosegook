const knexfile = require('../../knexfile')
const knex = require('knex')(knexfile[process.env.MODE_DATABASE])

module.exports = knex