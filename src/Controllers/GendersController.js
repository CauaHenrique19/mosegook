const knex = require('../database/connection')

class GendersControllers{
    async create(req, res){
        const { name, color } = req.body

        if(!name) return res.status(400).json({ message: 'Informe o nome por favor!' })
        if(!color) return res.status(400).json({ message: 'Informe a cor por favor!' })

        const gender = { name, color }

        const genderFinal = await knex('genders')
            .insert(gender, '*')

        return res.json(genderFinal)
    }
    async index(req, res){
        const genders = await knex('genders')
            .select('*')

        return res.json(genders)
    }
    async update(req, res){
        const { name, color } = req.body
        const { id } = req.params

        const genderUpdate = { id, name, color }
        
        const genderUpdated = await knex('genders')
            .update(genderUpdate, '*')
            .where({ id })

        return res.json({ message: 'Gênero Atualizado com sucesso!', genderUpdated })
    }
    async delete(req, res){
        const genderId = req.params.id

        knex('genders')
            .delete()
            .where({ id: genderId })
            .then(_ => res.json({ message: 'Gênero Excluido com sucesso!' }))
            .catch(err => res.status(500).json({ message: 'Ocorreu um erro inesperado ao deletar um gênero!' }))
    }
}

module.exports = new GendersControllers()