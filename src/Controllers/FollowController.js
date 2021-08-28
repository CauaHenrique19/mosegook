const knex = require("../database/connection")
const { formatDate } = require('../utils/formatDate')

class FollowController {
    async create(req, res) {
        try {
            const { user_id, following_user_id } = req.body

            const follow = {
                user_id,
                following_user_id,
                created_at: new Date().toLocaleString()
            }

            const followDB = await knex('follow')
                .insert(follow, '*')

            followDB.map(follow => follow.created_at = formatDate(follow.created_at))

            const pointToUser = {
                user_id,
                quantity: 2,
                action_description: 'follow',
                action_id: followDB[0].id,
                action_table: 'follow',
                created_at: new Date()
            }

            const pointToFollowingUser = {
                user_id: following_user_id,
                quantity: 4,
                action_description: 'following_me',
                action_id: followDB[0].id,
                action_table: 'follow',
                created_at: new Date()
            }

            const pointToUserDb = await knex('points')
                .insert(pointToUser, '*')

            pointToUserDb.map(point => point.created_at = formatDate(point.created_at))

            await knex('points')
                .insert(pointToFollowingUser, '*')

            res.json({ follow: followDB[0], point: pointToUserDb[0] })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    async usersToFollow(req, res) {
        try {
            const { id } = req.params

            const users = await knex.raw(`
                select id, name, users.user, url_image from users
                where not id = ${id}
                order by random()
                limit 5`)

            return res.json(users.rows)
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
    async followUser(req, res) {
        try {
            const { user_id, following_user_id } = req.params

            const follow = await knex('follow')
                .select('*')
                .where({ user_id, following_user_id })

            return res.json({ follow: follow.length > 0 ? true : false })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao verificar se segue usuário', error: error.message })
        }
    }
    async userFollow(req, res) {
        try {
            const { user_id, follower_id } = req.params

            const follow = await knex('follow')
                .select('*')
                .where({ user_id: follower_id, following_user_id: user_id })

            return res.json({ follow: follow.length > 0 ? true : false })
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao verificar se segue usuário', error: error.message })
        }
    }
    async delete(req, res) {
        try {
            const { user_id, following_user_id } = req.params

            await knex('points')
                .delete()
                .where({ action_table: 'follow', user_id })

            await knex('points')
                .delete()
                .where({ action_table: 'follow', user_id: following_user_id })

            knex('follow')
                .delete()
                .where({ user_id, following_user_id })
                .then(_ => res.json({ message: 'Você deixou de seguir este usuário!' }))
                .catch(error => res.status(500).json({ message: 'Erro inesperado ao tentar deixar de seguir usuário!', error: error.message }))
        }
        catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro inesperado!', error: error.message })
        }
    }
}

module.exports = new FollowController()