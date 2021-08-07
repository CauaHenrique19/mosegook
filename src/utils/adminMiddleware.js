const knex = require('../database/connection')
const jwt = require('jsonwebtoken')

module.exports = middleware => {
    return async (req, res, next) => {

        const { admin_id, token } = req.headers

        if(!admin_id){
            return res.json({ message: 'Id do administrador não informado!' })
        }

        return jwt.verify(token, process.env.SECRET, async (error, encoded) => {
            if(error){
                return res.json({ message: 'Token Inválido!' })
            }

            const adminDb = await knex('users')
                .select('admin')
                .where({ id: admin_id })
                .first()

            if(!adminDb.admin){
                return res.json({ message: 'Você não tem permissão para acessar esta rota!' })
            }

            return middleware(req, res, next)
        })

    }
}