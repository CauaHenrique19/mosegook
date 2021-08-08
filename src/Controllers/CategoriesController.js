const knex = require('../database/connection')

class CategoriesController{
    async create(req, res){
        const { name, color, icon } = req.body

        if(!name) return res.status(400).json({ message: 'Informe o nome por favor!' })
        if(!color) return res.status(400).json({ message: 'Informe a cor por favor!' })
        if(!icon) return res.status(400).json({ message: 'Informe o ícone por favor!' })

        const category = { name, color, icon }

        const categoryDB = await knex('categories')
            .insert(category, '*')

        return res.json(categoryDB)
    }
    async index(req, res){
        const categories = await knex('categories')
            .select('*')

        return res.json(categories)
    }
    async update(req, res){
        const { name, color, icon } = req.body
        const { id } = req.params

        const category = { id, name, color, icon }

        const categoryUpdated = await knex('categories')
            .update(category, '*')
            .where({ id })

        return res.json(categoryUpdated)
    }
    delete(req, res){
        const categoryId = req.params.id

        knex('categories')
            .delete()
            .where({ id: categoryId })
            .then(_ => res.json({ message: 'Categoria Excluida com sucesso!' }))
            .catch(err => res.status(500).json({ message: 'Ocorreu um erro inesperado ao deletar uma categoria!' }))
    }
}

module.exports = new CategoriesController()