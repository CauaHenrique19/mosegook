const knex = require("../database/connection")

class FollowController{
    async create(req, res){
        try{
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
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    async usersToFollow(req, res){
        try{
            const { id } = req.params
    
            const users = await knex.raw(`
                select id, name, users.user, url_image from users
                where not id = ${id}
                order by random()
                limit 5`)
    
            return res.json(users.rows)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    delete(req, res){
        try{
            const { user_id, following_user_id } = req.body
    
            knex('follow')
                .delete()
                .where({ user_id, following_user_id })
                .then(_ => res.json({ message: 'Você deixou de seguir este usuário!' }))
                .catch(error => res.status(500).json({ message: 'Erro inesperado ao tentar deixar de seguir usuário!', error: error.message }))
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
}

module.exports = new FollowController()