const knex = require('../database/connection')
const { formatDate } = require('../utils/formatDate')

class ComentsController{
    async create(req, res){
        const { user_id, avaliation_id, content } = req.body

        if(!content) return res.status(400).json({ message: 'Informe o conteúdo da avaliação!' })

        const coment = { 
            user_id, 
            avaliation_id, 
            content, 
            created_at: new Date() 
        }

        const comentDb = await knex('coments')
            .insert(coment, '*')

        return res.json({ coment: comentDb })
    }
    async getComentUser(req, res){
        const user = req.params.user

        const comentsDB = await knex('coments')
            .select('coments.id', 'coments.avaliation_id', 'coments.content', 
                    'coments.created_at', 'medias.name as media_name', 'categories.name as category_name', 
                    'categories.color as category_color', 'categories.icon as category_icon')
            .join('users', 'users.id', 'user_id')
            .join('avaliations', 'avaliations.id', 'coments.avaliation_id')
            .join('medias', 'medias.id', 'avaliations.media_id')
            .join('categories', 'categories.id', 'medias.category_id')
            .where('users.user', user)

        comentsDB.map(coment => coment.created_at = formatDate(coment.created_at))

        return res.json({ coments: comentsDB })
    }
    delete(req, res){
        const id = req.params.id

        knex('coments')
            .delete()
            .where({ id })
            .then(_ => res.json({ message: 'Comentário Excluído com Sucesso!' }))
            .catch(error => res.json({ message: 'Erro ao tentar excluir comentário', error: error.message }))
    }
}

module.exports = new ComentsController()