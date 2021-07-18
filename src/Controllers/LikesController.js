const knex = require('../database/connection')
const { formatDate } = require('../utils/formatDate')

class LikesController{
    async createLikeAvaliations(req, res){
        try{
            const { user_id, avaliation_id } = req.body

            const like = {
                user_id,
                avaliation_id,
                created_at: new Date()
            }

            const likeDb = await knex('likes_in_avaliations')
                .insert(like, '*')

            likeDb.map(like => like.created_at = formatDate(like.created_at))

            return res.json(likeDb)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao curtir', error: error.message })
        }
    }
    deleteLikeAvaliations(req, res){
        try{
            const { id } = req.params

            knex('likes_in_avaliations')
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

module.exports = new LikesController()