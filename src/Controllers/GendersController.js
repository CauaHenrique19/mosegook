const knex = require('../database/connection')

class GendersControllers{
    async create(req, res){
        try{
            const { name, color } = req.body
    
            if(!name) return res.status(400).json({ message: 'Informe o nome por favor!' })
            if(!color) return res.status(400).json({ message: 'Informe a cor por favor!' })
    
            const gender = { name, color }
    
            const genderFinal = await knex('genders')
                .insert(gender, '*')
    
            return res.json(genderFinal)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao criar gênero', error: error.message })
        }
    }
    async index(req, res){
        try{
            const genders = await knex('genders')
                .select('*')
    
            return res.json(genders)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao buscar gêneros', error: error.message })
        }
    }
    async update(req, res){
        try{
            const { name, color } = req.body
            const { id } = req.params
    
            const genderUpdate = { id, name, color }
            
            const genderUpdated = await knex('genders')
                .update(genderUpdate, '*')
                .where({ id })
    
            return res.json(genderUpdated)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao atualizar gênero', error: error.message })
        }
    }
    async statistics(req, res){
        try{
            const [amount_genders] = await knex('genders')
                .count('id as amount_genders')
    
            const [gender_most_utilized] = await knex('genders_in_medias')
                .select('gender_id', 'genders.name')
                .count('gender_id as count')
                .join('genders', 'genders.id', 'gender_id')
                .groupBy('gender_id', 'genders.name')
                .orderBy('count', 'desc')

            const [gender_most_popular] = await knex('user_preferences_genders')
                .select('gender_id', 'genders.name')
                .count('gender_id as count')
                .join('genders', 'genders.id', 'gender_id')
                .groupBy('gender_id', 'genders.name')
                .orderBy('count', 'desc')
            
            return res.json({ amount_genders: amount_genders.amount_genders, gender_most_utilized, gender_most_popular })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao pegar estatísticas', error: error.message })
        }
    }
    async delete(req, res){
        try{
            const genderId = req.params.id
    
            knex('genders')
                .delete()
                .where({ id: genderId })
                .then(_ => res.json({ message: 'Gênero Excluido com sucesso!' }))
                .catch(err => res.status(500).json({ message: 'Ocorreu um erro inesperado ao deletar um gênero!' }))
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao deletar gênero', error: error.message })
        }
    }
}

module.exports = new GendersControllers()