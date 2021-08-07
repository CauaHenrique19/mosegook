const knex = require('../database/connection')
const { formatDate } = require('../utils/formatDate')

class LikesInComentsController{
    async createLikeComents(req, res){
        try{
            const { user_id, coment_id } = req.body

            const like = {
                user_id,
                coment_id,
                created_at: new Date()
            }

            const likeDb = await knex('likes_in_coments')
                .insert(like, '*')

            likeDb.map(like => like.created_at = formatDate(like.created_at))

            return res.json(likeDb)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao curtir', error: error.message })
        }
    }
    async getLikeComentsPerUser(req, res){
        try{
            const { user_id, id } = req.params
    
            const like = await knex('likes_in_coments')
                .select('*')
                .where({ user_id })
                .andWhere({ coment_id: id })
                .first()
    
            if(like){
                like.created_at = formatDate(like.created_at)
                return res.json(like)
            }
            else{
                return res.json({})
            }
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao pegar curtida', error: error.message })
        }
    }
    deleteLikeComents(req, res){
        try{
            const { id } = req.params
    
            knex('likes_in_coments')
                .delete()
                .where({ id })
                .then(_ => res.json({ message: 'Descurtido com sucesso!' }))
                .catch(error => res.status(500).json({ message: 'Ocorreu um erro ao descurtir', error: error.message }))
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao descurtir', error: error.message })
        }
    }
}

module.exports = new LikesInComentsController()