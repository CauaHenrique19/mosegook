const knex = require('../database/connection')

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