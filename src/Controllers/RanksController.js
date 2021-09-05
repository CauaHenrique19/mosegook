const knex = require('../database/connection')

class RanksController{
    async create(req, res){
        try{
            const { name, color, value_to_enter, value_to_up } = req.body
            const rank = { name, color, value_to_enter, value_to_up }
    
            const rankDb = await knex('ranks')
                .insert(rank, '*')
    
            return res.json(rankDb)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao criar rank!', error: error.message })
        }
    }
    async index(req, res){
        try{
            const ranks = await knex('ranks')
                .select('*')

            return res.json(ranks)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar ranks!', error: error.message })
        }
    }
    async update(req, res){
        try{
            const id = req.params.id
            const { name, color, value_to_enter, value_to_up } = req.body
            const rank = { name, color, value_to_enter, value_to_up }
    
            const updatedRank = await knex('ranks')
                .update(rank, '*')
                .where({ id })
    
            return res.json(updatedRank)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao atualizar rank!', error: error.message })
        }
    }
    async top(req, res){
        try{
            const users = await knex('points')
                .select('user_id', 'users.name as user_name', 'users.user as user_user',
                        'users.url_image')
                .sum('quantity as points')
                .join('users', 'users.id', 'points.user_id')
                .groupBy('user_id', 'user_name', 'user_user', 'users.url_image')
                .orderBy('points', 'DESC')
                .limit(3)

            for(let i = 0; i < users.length; i++){
                const rank = await knex('ranks')
                    .select('id', 'name', 'color')
                    .whereRaw(`${users[i].points} between value_to_enter and value_to_up`)

                users[i].rank = rank
            }

            return res.json(users)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar top 3!', error: error.message })
        }
    }
}

module.exports = new RanksController()