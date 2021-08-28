const knex = require('../database/connection')
const { formatDate } = require('../utils/formatDate')

class LikesInAvaliationsController{
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

            const avaliation_user_id = await knex('avaliations')
                .select('user_id')
                .where({ id: avaliation_id })
                .first()

            if(avaliation_user_id.user_id !== user_id){
                const point = {
                    user_id: avaliation_user_id.user_id,
                    quantity: 4,
                    action_description: 'like_in_avaliations',
                    action_id: likeDb[0].id,
                    action_table: 'likes_in_avaliations',
                    created_at: new Date()
                }
    
                await knex('points')
                    .insert(point)
            }

            return res.json(likeDb)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao curtir', error: error.message })
        }
    }
    async getLikeAvaliationsPerUser(req, res){
        try{
            const { userId, id } = req.params
    
            const like = await knex('likes_in_avaliations')
                .select('*')
                .where({ user_id: userId })
                .andWhere({ avaliation_id: id })
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
    async deleteLikeAvaliations(req, res){
        try{
            const { id } = req.params

            await knex('points')
                .delete()
                .where({ action_table: 'likes_in_avaliations', action_id: id })

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

module.exports = new LikesInAvaliationsController()