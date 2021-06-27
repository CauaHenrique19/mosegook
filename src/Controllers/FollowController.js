const knex = require("../database/connection")

class FollowController{
    async create(req, res){
        const { user_id, following_user_id } = req.body

        const follow = {
            user_id, 
            following_user_id,
            created_at: new Date().toLocaleString()
        }

        const followDB = await knex('follow')
            .insert(follow, '*')
        
        res.json(followDB)
    }
    delete(req, res){
        const { user_id, following_user_id } = req.body

        knex('follow')
            .delete()
            .where({ user_id, following_user_id })
            .then(_ => res.json({ message: 'Você deixou de seguir este usuário!' }))
            .catch(error => res.status(500).json({ message: 'Erro inesperado ao tentar deixar de seguir usuário!', error: error.message }))
    }
}

module.exports = new FollowController()