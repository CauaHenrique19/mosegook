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
                .select('coments.id', 'coments.avaliation_id', 'coments.content',
                    'coments.created_at', 'medias.name as media_name', 'categories.name as category_name',
                    'categories.color as category_color', 'categories.icon as category_icon', 'users.user as user_user',
                    'users.name as user_name')
                .join('users', 'users.id', 'user_id')
                .join('avaliations', 'avaliations.id', 'coments.avaliation_id')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .join('categories', 'categories.id', 'medias.category_id')
                .where('users.user', user)
                .orderBy('coments.created_at', 'DESC')

            comentsDB.map(coment => coment.created_at = formatDate(coment.created_at))

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

                const myComents = await knex('coments')
                    .select('coments.*', 'avaliations.media_id', 'medias.name as media_name', 'medias.category_id', 
                            'categories.color as category_color', 'categories.name as category_name', 'categories.icon as category_icon',
                            'users.name as user_name', 'users.user as user_user')
                    .join('users', 'users.id', 'coments.user_id')
                    .join('avaliations', 'avaliations.id', 'coments.avaliation_id')
                    .join('medias', 'medias.id', 'avaliations.media_id')
                    .join('categories', 'categories.id', 'medias.category_id')
                    .where('coments.user_id', userId)
                    .orderBy('coments.created_at', 'DESC')

                coments.push(myComents)
                coments[0].map(coment => coment.created_at = formatDate(coment.created_at))

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

                const myComents = await knex('coments')
                    .select('coments.*', 'avaliations.media_id', 'medias.name as media_name', 'medias.category_id', 
                            'categories.color as category_color', 'categories.name as category_name', 'categories.icon as category_icon',
                            'users.name as user_name', 'users.user as user_user')
                    .join('users', 'users.id', 'coments.user_id')
                    .join('avaliations', 'avaliations.id', 'coments.avaliation_id')
                    .join('medias', 'medias.id', 'avaliations.media_id')
                    .join('categories', 'categories.id', 'medias.category_id')
                    .where('coments.user_id', userId)
                    .orderBy('coments.created_at', 'DESC')

                coments.push(myComents)
                console.log(myComents)
                coments[0].map(coment => coment.created_at = formatDate(coment.created_at))

                return res.json(coments[0])
            }
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    delete(req, res) {
        try {
            const id = req.params.id

            knex('coments')
                .delete()
                .where({ id })
                .then(_ => res.json({ message: 'Comentário Excluído com Sucesso!' }))
                .catch(error => res.json({ message: 'Erro ao tentar excluir comentário', error: error.message }))
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
}

module.exports = new ComentsController()