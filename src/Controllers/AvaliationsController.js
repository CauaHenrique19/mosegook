const knex = require("../database/connection")
const { formatDate } = require('../utils/formatDate')

class AvaliationsController {
    async index(req, res) {
        try {
            const avaliations = await knex('avaliations')
                .select('avaliations.id', 'avaliations.user_id', 'avaliations.media_id',
                    'avaliations.content', 'avaliations.created_at', 'avaliations.stars',
                    'users.name as user_name', 'users.user as user_user', 'medias.name as media_name',
                    'categories.color as category_color', 'categories.icon as category_icon')
                .join('users', 'users.id', 'avaliations.user_id')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .join('categories', 'categories.id', 'medias.category_id')

            for (let i = 0; i < avaliations.length; i++) {
                const amountComents = await knex('coments')
                    .count('avaliation_id')
                    .where('avaliation_id', avaliations[i].id)
                    .first()

                const amountLikes = await knex('likes_in_avaliations')
                    .count('avaliation_id')
                    .where('avaliation_id', avaliations[i].id)
                    .first()

                avaliations[i].created_at = formatDate(avaliations[i].created_at)
                avaliations[i].amountComents = amountComents.count
                avaliations[i].amountLikes = amountLikes.count
            }

            return res.json(avaliations)
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao pegar avaliações', error: error.message })
        }
    }
    async detailed(req, res) {
        try {
            const id = req.params.id

            const avaliationsDB = await knex('avaliations')
                .select('avaliations.id', 'avaliations.user_id', 'avaliations.media_id',
                    'avaliations.content', 'avaliations.created_at', 'avaliations.stars',
                    'users.name as user_name', 'users.user as user_user', 'medias.name as media_name',
                    'medias.url_poster', 'categories.color as category_color', 'categories.icon as category_icon')
                .join('users', 'users.id', 'avaliations.user_id')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .join('categories', 'categories.id', 'medias.category_id')
                .where('avaliations.id', id)
                .first()

            avaliationsDB.created_at = formatDate(avaliationsDB.created_at)

            const [amountLikes] = await knex('likes_in_avaliations')
                .count('avaliation_id as amount_likes')
                .where({ avaliation_id: id })

            const [amountComents] = await knex('coments')
                .count('avaliation_id as amount_coments')
                .where({ avaliation_id: id })

            avaliationsDB.amountLikes = amountLikes.amount_likes
            avaliationsDB.amountComents = amountComents.amount_coments

            const comentsDB = await knex('coments')
                .select('coments.*', 'users.name as user_name', 'users.user as user_user', 
                        'categories.color as category_color', 'categories.icon as category_icon','medias.name as media_name')
                .join('users', 'users.id', 'coments.user_id')
                .join('avaliations', 'avaliations.id', 'coments.avaliation_id')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .join('categories', 'categories.id', 'medias.category_id')
                .orderBy('coments.created_at', 'DESC')
                .where({ avaliation_id: id })

            for(let i = 0; i < comentsDB.length; i++){
                const [amountLikesInComents] = await knex('likes_in_coments')
                    .count('coment_id as amount_likes')
                    .where({ coment_id: comentsDB[i].id })
                    
                comentsDB[i].created_at = formatDate(comentsDB[i].created_at)
                comentsDB[i].amountLikes = amountLikesInComents.amount_likes
            }

            const genders = await knex('genders_in_medias')
                .select('genders_in_medias.id', 'genders.color', 'genders.name')
                .join('genders', 'genders.id', 'genders_in_medias.gender_id')
                .where({ media_id: avaliationsDB.media_id })

            const media = {
                id: avaliationsDB.media_id,
                url_poster: avaliationsDB.url_poster,
                media_name: avaliationsDB.media_name 
            }

            delete avaliationsDB.media_id 
            delete avaliationsDB.url_poster 
            delete avaliationsDB.media_name 

            return res.json({ avaliation: avaliationsDB, media, coments: comentsDB, genders })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao pegar avaliação detalhada', error: error.message })
        }
    }
    async create(req, res) {
        try {
            const { user_id, media_id, content, stars } = req.body

            const avaliations = {
                user_id,
                media_id,
                content,
                stars,
                created_at: new Date()
            }

            const avaliationsDB = await knex('avaliations')
                .insert(avaliations, '*')

            avaliationsDB.map(avaliation => avaliation.created_at = formatDate(avaliation.created_at))

            const point = {
                user_id,
                quantity: 2,
                action_description: 'avaliation',
                action_id: avaliationsDB[0].id,
                action_table: 'avaliations',
                created_at: new Date()
            }

            const pointDb = await knex('points')
                .insert(point, '*')

            pointDb.map(point => point.created_at = formatDate(point.created_at))

            return res.json({ avaliation: avaliationsDB[0], point: pointDb[0] })
        }
        catch (error) {
            await trx.rollback()
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao avaliar', error: error.message })
        }
    }
    async getAvaliationsTimeline(req, res) {
        try {
            const userId = req.params.id

            const userFollowing = await knex('follow')
                .select('following_user_id')
                .where({ user_id: userId })

            if (userFollowing.length === 0) {
                const mediasPreference = await knex('user_preferences_medias')
                    .select('media_id')
                    .where({ user_id: userId })

                if (mediasPreference.length === 0) {
                    return res.json({ message: 'O usuário não possui preferência por mídias.' })
                }

                const usersWhereComand = mediasPreference
                    .map((media, index) => index === 0 ? `avaliations.media_id = ${media.media_id} ` : `or avaliations.media_id = ${media.media_id} `)
                    .join('')

                const avaliationsTimeline = await knex.raw(`
                    select 
                        avaliations.*,
                        medias.name as media_name,
                        categories.color as category_color,
                        categories.icon as category_icon,
                        users.name as user_name,
                        users.user as user_user
                    from avaliations
                    inner join medias on medias.id = avaliations.media_id
                    inner join categories on categories.id = medias.category_id
                    inner join users on users.id = avaliations.user_id
                    where ${usersWhereComand}
                    order by created_at DESC;`)

                const myAvaliations = await knex('avaliations')
                    .select('avaliations.*', 'medias.name as media_name', 'categories.color as category_color', 
                            'categories.icon as category_icon', 'users.name as user_name', 'users.user as user_user')
                    .join('medias', 'medias.id', 'avaliations.media_id')
                    .join('categories', 'categories.id', 'medias.category_id')
                    .join('users', 'users.id', 'avaliations.user_id')
                    .orderBy('created_at', 'desc')
                    .where({ user_id: userId })

                avaliationsTimeline.rows.push(...myAvaliations)

                avaliationsTimeline.rows.sort((a, b) => {
                    if (a.created_at < b.created_at) {
                        return 1;
                    }
                    if (a.created_at > b.created_at) {
                        return -1;
                    }
                    return 0
                })

                for (let i = 0; i < avaliationsTimeline.rows.length; i++) {

                    const amountComents = await knex('coments')
                        .count('avaliation_id')
                        .where('avaliation_id', avaliationsTimeline.rows[i].id)
                        .first()

                    const amountLikes = await knex('likes_in_avaliations')
                        .count('avaliation_id')
                        .where('avaliation_id', avaliationsTimeline.rows[i].id)
                        .first()

                    avaliationsTimeline.rows[i].created_at = formatDate(avaliationsTimeline.rows[i].created_at)
                    avaliationsTimeline.rows[i].amountComents = amountComents.count
                    avaliationsTimeline.rows[i].amountLikes = amountLikes.count
                }

                return res.json({ avaliations: avaliationsTimeline.rows })
            }
            else {
                const usersWhereComand = userFollowing
                    .map((user, index) => index === 0 ? `avaliations.user_id = ${user.following_user_id} ` : `or avaliations.user_id = ${user.following_user_id} `)
                    .join('')

                const avaliationsTimeline = await knex.raw(`
                    select 
                        avaliations.*,
                        medias.name as media_name,
                        categories.color as category_color,
                        categories.icon as category_icon,
                        users.name as user_name,
                        users.user as user_user
                    from avaliations
                    inner join medias on medias.id = avaliations.media_id
                    inner join categories on categories.id = medias.category_id
                    inner join users on users.id = avaliations.user_id
                    where ${usersWhereComand}
                    order by created_at DESC;`)

                const myAvaliations = await knex('avaliations')
                    .select('avaliations.*', 'medias.name as media_name', 'categories.color as category_color', 
                            'categories.icon as category_icon', 'users.name as user_name', 'users.user as user_user')
                    .join('medias', 'medias.id', 'avaliations.media_id')
                    .join('categories', 'categories.id', 'medias.category_id')
                    .join('users', 'users.id', 'avaliations.user_id')
                    .orderBy('created_at', 'desc')
                    .where({ user_id: userId })

                avaliationsTimeline.rows.push(...myAvaliations)

                avaliationsTimeline.rows.sort((a, b) => {
                    if (a.created_at < b.created_at) {
                        return 1;
                    }
                    if (a.created_at > b.created_at) {
                        return -1;
                    }
                    return 0
                })

                for (let i = 0; i < avaliationsTimeline.rows.length; i++) {
                    const amountComents = await knex('coments')
                        .count('avaliation_id')
                        .where('avaliation_id', avaliationsTimeline.rows[i].id)
                        .first()

                    const amountLikes = await knex('likes_in_avaliations')
                        .count('avaliation_id')
                        .where('avaliation_id', avaliationsTimeline.rows[i].id)
                        .first()

                    avaliationsTimeline.rows[i].created_at = formatDate(avaliationsTimeline.rows[i].created_at)
                    avaliationsTimeline.rows[i].amountComents = amountComents.count
                    avaliationsTimeline.rows[i].amountLikes = amountLikes.count
                }

                return res.json({ avaliations: avaliationsTimeline.rows })
            }
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    async getAvaliationsUser(req, res) {
        try {
            const user = req.params.user

            const avaliations = await knex('avaliations')
                .select('avaliations.*', 'medias.name as media_name', 'categories.name as category_name',
                    'categories.color as category_color', 'categories.icon as category_icon', 'users.name as user_name',
                    'users.user as user_user')
                .join('users', 'users.id', 'avaliations.user_id')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .join('categories', 'categories.id', 'medias.category_id')
                .where('users.user', user)
                .orderBy('avaliations.created_at', 'DESC')

            for (let i = 0; i < avaliations.length; i++) {
                const amountComents = await knex('coments')
                    .count('avaliation_id')
                    .where('avaliation_id', avaliations[i].id)
                    .first()

                const amountLikes = await knex('likes_in_avaliations')
                    .count('avaliation_id')
                    .where('avaliation_id', avaliations[i].id)
                    .first()

                avaliations[i].created_at = formatDate(avaliations[i].created_at)
                avaliations[i].amountComents = amountComents.count
                avaliations[i].amountLikes = amountLikes.count
            }
            
            return res.json({ avaliations: avaliations })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao pegar avaliação de usuário', error: error.message })
        }
    }
    async delete(req, res) {
        try {
            const avaliation_id = req.params.id

            const coments = await knex('coments')
                .select('id')
                .where({ avaliation_id })

            for(let i = 0; i < coments.length; i++){
                await knex('likes_in_coments')
                    .delete()
                    .where({ coment_id: coments[i].id })
            }
            
            await knex('coments')
                .delete()
                .where({ avaliation_id })

            await knex('likes_in_avaliations')
                .delete()
                .where({ avaliation_id })

            await knex('avaliations')
                .delete()
                .where({ id: avaliation_id })

            await knex('points')
                .delete()
                .where({ action_table: 'avaliations', action_id: avaliation_id })

            res.json({ message: 'Avaliação excluída com sucesso!' })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao excluir avaliação', error: error.message })
        }
    }
}

module.exports = new AvaliationsController()