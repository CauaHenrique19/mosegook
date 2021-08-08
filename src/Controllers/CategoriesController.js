const knex = require('../database/connection')

class CategoriesController{
    async create(req, res){
        try{
            const { name, color, icon } = req.body
    
            if(!name) return res.status(400).json({ message: 'Informe o nome por favor!' })
            if(!color) return res.status(400).json({ message: 'Informe a cor por favor!' })
            if(!icon) return res.status(400).json({ message: 'Informe o ícone por favor!' })
    
            const category = { name, color, icon }
    
            const categoryDB = await knex('categories')
                .insert(category, '*')
    
            return res.json(categoryDB)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao criar categoria!', error: error.message })
        }
    }
    async index(req, res){
        try{
            const categories = await knex('categories')
                .select('*')
    
            return res.json(categories)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao buscar categorias!', error: error.message })
        }
    }
    async update(req, res){
        try{
            const { name, color, icon } = req.body
            const { id } = req.params
    
            const category = { id, name, color, icon }
    
            const categoryUpdated = await knex('categories')
                .update(category, '*')
                .where({ id })
    
            return res.json(categoryUpdated)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao atualizar a categoria!', error: error.message })
        }
    }
    async statistics(req, res){
        try{
            const [amount_movies] = await knex('medias')
                .count('category_id as amount_movies')
                .where({ category_id: 1 })

            const [amount_games] = await knex('medias')
                .count('category_id as amount_games')
                .where({ category_id: 2 })

            const [amount_books] = await knex('medias')
                .count('category_id as amount_books')
                .where({ category_id: 3 })

            const [amount_series] = await knex('medias')
                .count('category_id as amount_series')
                .where({ category_id: 4 })

            return res.json({ 
                amount_movies: amount_movies.amount_movies, 
                amount_games: amount_games.amount_games,
                amount_books: amount_books.amount_books,
                amount_series: amount_series.amount_series
            })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao buscar estatísticas de categorias!', error: error.message })
        }
    }
    delete(req, res){
        try{
            const categoryId = req.params.id
    
            knex('categories')
                .delete()
                .where({ id: categoryId })
                .then(_ => res.json({ message: 'Categoria Excluida com sucesso!' }))
                .catch(err => res.status(500).json({ message: 'Ocorreu um erro inesperado ao deletar uma categoria!' }))
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao excluir a categoria!', error: error.message })
        }
    }
}

module.exports = new CategoriesController()