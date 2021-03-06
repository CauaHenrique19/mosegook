const knex = require('../database/connection')
const { formatDate } = require('../utils/formatDate')

class ComentsController {
    async create(req, res) {
        try {
            const { user_id, avaliation_id, content } = req.body

            if (!content) return res.status(400).json({ message: 'Informe o conteúdo da avaliação!' })

            const coment = {
                user_id,
                avaliation_id,
                content,
                created_at: new Date()
            }

            const comentDb = await knex('coments')
                .insert(coment, '*')

            comentDb.map(coment => coment.created_at = formatDate(coment.created_at))

            const avaliation_user_id = await knex('avaliations')
                .select('user_id')
                .where({ user_id, id: avaliation_id })
                .first()

            if(avaliation_user_id === undefined){
                const point = {
                    user_id,
                    quantity: 2,
                    action_description: 'coment',
                    action_id: comentDb[0].id,
                    action_table: 'coments',
                    created_at: new Date()
                }

                const pointDb = await knex('points')
                    .insert(point, '*')

                pointDb.map(point => point.created_at = formatDate(point.created_at))
                return res.json({ coment: comentDb[0], point: pointDb[0] })     
            }

            return res.json({ coment: comentDb })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    async getComentUser(req, res) {
        try {
            const user = req.params.user

            const comentsDB = await knex('coments')
                .select('coments.user_id', 'coments.id', 'coments.avaliation_id', 'coments.content',
                    'coments.created_at', 'medias.name as media_name', 'categories.name as category_name',
                    'categories.color as category_color', 'categories.icon as category_icon', 'users.user as user_user',
                    'users.name as user_name')
                .join('users', 'users.id', 'user_id')
                .join('avaliations', 'avaliations.id', 'coments.avaliation_id')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .join('categories', 'categories.id', 'medias.category_id')
                .where('users.user', user)
                .orderBy('coments.created_at', 'DESC')

            for(let i = 0; i < comentsDB.length; i++){
                const [amount_likes] = await knex('likes_in_coments')
                    .count('coment_id as amount_likes')
                    .where({ coment_id: comentsDB[i].id })
    
                comentsDB[i].created_at = formatDate(comentsDB[i].created_at)
                comentsDB[i].amountLikes = amount_likes.amount_likes
            }

            return res.json({ coments: comentsDB })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    async getComentsTimeline(req, res) {
        try{
            const userId = req.params.id
    
            const userFollowing = await knex('follow')
                .select('following_user_id')
                .where({ user_id: userId })
    
            if(userFollowing.length === 0) {
                const mediasPreference = await knex('user_preferences_medias')
                    .select('media_id')
                    .where({ user_id: userId })
    
                if(mediasPreference.length === 0){
                    return res.json({ message: 'O usuário não possui preferência por mídias.' })
                }
    
                const avaliationsWhereComand = mediasPreference
                    .map((media, index) => index === 0 ? `avaliations.media_id = ${media.media_id} ` : `or avaliations.media_id = ${media.media_id} `)
                    .join('')
    
                const avaliationsTimelineId = await knex('avaliations')
                    .select('id')
                    .whereRaw(avaliationsWhereComand)
     
                const comentsWhereComand = avaliationsTimelineId
                    .map((avaliation, index) => index === 0 ? `coments.avaliation_id = ${avaliation.id} ` : `or coments.avaliation_id = ${avaliation.id} `)
                    .join('')
    
                const coments = await knex('coments')
                    .select('coments.*', 'avaliations.media_id', 'medias.name as media_name', 'medias.category_id', 
                            'categories.color as category_color', 'categories.name as category_name', 'categories.icon as category_icon',
                            'users.name as user_name', 'users.user as user_user')
                    .join('users', 'users.id', 'coments.user_id')
                    .join('avaliations', 'avaliations.id', 'coments.avaliation_id')
                    .join('medias', 'medias.id', 'avaliations.media_id')
                    .join('categories', 'categories.id', 'medias.category_id')
                    .orderBy('coments.created_at', 'DESC')
                    .whereRaw(comentsWhereComand)
                    .orWhere('avaliations.user_id', userId)

                for(let i = 0; i < coments.length; i++){
                    const amountLikes = await knex('likes_in_coments')
                        .count('coment_id')
                        .where('coment_id', coments[i].id)
                        .first()

                    coments[i].created_at = formatDate(coments[i].created_at)
                    coments[i].amountLikes = amountLikes.count
                }

                return res.json(coments)
            }
            else if (userFollowing.length > 0) {
                const usersWhereComand = userFollowing
                    .map((user, index) => index === 0 ? `avaliations.user_id = ${user.following_user_id} ` : `or avaliations.user_id = ${user.following_user_id} `)
                    .join('')
    
                const coments = await knex('coments')
                    .select('coments.*', 'avaliations.media_id', 'medias.name as media_name', 'medias.category_id', 
                            'categories.color as category_color', 'categories.name as category_name', 'categories.icon as category_icon',
                            'users.name as user_name', 'users.user as user_user')
                    .join('users', 'users.id', 'coments.user_id')
                    .join('avaliations', 'avaliations.id', 'coments.avaliation_id')
                    .join('medias', 'medias.id', 'avaliations.media_id')
                    .join('categories', 'categories.id', 'medias.category_id')
                    .orderBy('coments.created_at', 'DESC')
                    .whereRaw(usersWhereComand)
                    .orWhere('avaliations.user_id', userId)

                for(let i = 0; i < coments.length; i++){
                    const amountLikes = await knex('likes_in_coments')
                        .count('coment_id')
                        .where('coment_id', coments[i].id)
                        .first()
    
                    coments[i].created_at = formatDate(coments[i].created_at)
                    coments[i].amountLikes = amountLikes.count
                }

                return res.json(coments)
            }
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    async delete(req, res) {
        try {
            const id = req.params.id
            
            await knex('likes_in_coments')
                .delete()
                .where({ coment_id: id })

            await knex('coments')
                .delete()
                .where({ id })

            await knex('points')
                .delete()
                .where({ action_table: 'coments', action_id: id })
                
            return res.json({ message: 'Comentário excluído com sucesso!' })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
}

module.exports = new ComentsController()