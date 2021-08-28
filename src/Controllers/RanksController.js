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
}

module.exports = new RanksController()