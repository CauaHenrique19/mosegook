const knex = require("../database/connection")
const { formatDate } = require('../utils/formatDate')

class AvaliationsController{
    async index(req, res){
        const avaliations = await knex('avaliations')
            .select('avaliations.id', 'avaliations.user_id', 'avaliations.media_id', 
                    'avaliations.content', 'avaliations.created_at', 'avaliations.stars',
                    'users.name as user_name', 'users.user as user_user', 'medias.name as media_name',
                    'categories.color as category_color', 'categories.icon as category_icon')
            .join('users', 'users.id', 'avaliations.user_id')
            .join('medias', 'medias.id', 'avaliations.media_id')
            .join('categories', 'categories.id', 'medias.category_id')

        avaliations.map(avaliation => avaliation.created_at = formatDate(avaliation.created_at))

        return res.json(avaliations)
    }
    async detailed(req, res){
        const id = req.params.id

        const avaliationsDB = await knex('avaliations')
            .select('avaliations.id', 'avaliations.user_id', 'avaliations.media_id', 
                    'avaliations.content', 'avaliations.created_at', 'avaliations.stars',
                    'users.name as user_name', 'users.user as user_user', 'medias.name as media_name',
                    'medias.url_poster','categories.color as category_color', 'categories.icon as category_icon')
            .join('users', 'users.id', 'avaliations.user_id')
            .join('medias', 'medias.id', 'avaliations.media_id')
            .join('categories', 'categories.id', 'medias.category_id')
            .where('avaliations.id', id)
            .first()

        avaliationsDB.created_at = formatDate(avaliationsDB.created_at)

        const comentsDB = await knex('coments')
            .select('coments.*', 'users.name', 'users.user')
            .join('users', 'users.id', 'coments.user_id')
            .where({ avaliation_id : id })

        comentsDB.map(coment => coment.created_at = formatDate(coment.created_at))

        const genders = await knex('genders_in_medias')
            .select('genders_in_medias.id', 'genders.color', 'genders.name')
            .join('genders', 'genders.id' ,'genders_in_medias.gender_id')
            .where({ media_id: avaliationsDB.media_id })

        return res.json({ avaliation: avaliationsDB, coments: comentsDB, genders })
    }
    async create(req, res){
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

        avaliationsDB.map(avaliation => avaliation.created_at = avaliation.created_at.toLocaleString())

        return res.json(avaliationsDB)
    }
    async getAvaliationsTimeline(req, res){
        try{
            const userId = req.params.id
    
            const userFollowing = await knex('follow')
                .select('following_user_id')
                .where({ user_id: userId })
    
            if(userFollowing.length === 0){
                const mediasPreference = await knex('user_preferences_medias')
                    .select('media_id')
                    .where({ user_id : userId })
    
                if(mediasPreference.length === 0){
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
                    inner join follow on follow.following_user_id = avaliations.user_id
                    inner join medias on medias.id = avaliations.media_id
                    inner join categories on categories.id = medias.category_id
                    inner join users on users.id = avaliations.user_id
                    where ${usersWhereComand}
                    order by created_at DESC;`)

                avaliationsTimeline.rows.map(avaliation => avaliation.created_at = formatDate(avaliation.created_at))

                return res.json({ avaliations : avaliationsTimeline.rows })
            }
            else{
    
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
                    inner join follow on follow.following_user_id = avaliations.user_id
                    inner join medias on medias.id = avaliations.media_id
                    inner join categories on categories.id = medias.category_id
                    inner join users on users.id = avaliations.user_id
                    where ${usersWhereComand}
                    order by created_at DESC;`)
    
                avaliationsTimeline.rows.map(avaliation => avaliation.created_at = formatDate(avaliation.created_at))
        
                return res.json({ avaliations : avaliationsTimeline.rows })
            }
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    async getAvaliationsUser(req, res){
        const user = req.params.user

        const avaliationsDB = await knex('avaliations')
            .select('avaliations.*', 'medias.name as media_name', 'categories.name as category_name', 
                    'categories.color as category_color', 'categories.icon as category_icon', 'users.name as user_name', 
                    'users.user as user_user')
            .join('users', 'users.id', 'avaliations.user_id')
            .join('medias', 'medias.id', 'avaliations.media_id')
            .join('categories', 'categories.id', 'medias.category_id')
            .where('users.user', user)
            .orderBy('avaliations.created_at', 'DESC')
        avaliationsDB.map(avaliation => avaliation.created_at = formatDate(avaliation.created_at))

        return res.json({ avaliations: avaliationsDB })
    }
    delete(req, res){
        const avaliation_id = req.params.id

        knex('avaliations')
            .delete()
            .where({ id: avaliation_id })
            .then(_ => res.json({ message: 'Avaliação excluída com sucesso!' }))
            .catch(error => res.status(500).json({ message: 'Ocorreu um erro inesperado ao tentar excluir avaliação', error: error.message }))
    }
}

module.exports = new AvaliationsController()