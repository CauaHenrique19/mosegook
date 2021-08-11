const knex = require('../database/connection')
const { formatDate } = require('../utils/formatDate')

class OpinionsController{
    async create(req, res){
        try{
            const { user_id, content } = req.body
    
            const opinion = {
                user_id,
                content,
                created_at: new Date()
            }
    
            const opinionDb = await knex('opinions')
                .insert(opinion, '*')
    
            opinionDb.map(opinion => opinion.created_at = formatDate(opinion.created_at))

            return res.json(opinionDb)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao criar opinão!', error: error.message })
        }
    }
    async index(req, res){
        try{
            const opinions = await knex('opinions')
                .select('opinions.*', 'users.url_image', 'users.name', 'users.user')
                .join('users', 'users.id', 'opinions.user_id')
    
            opinions.map(opinion => opinion.created_at = formatDate(opinion.created_at))
            
            return res.json(opinions)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao pegar opinões!', error: error.message })
        }
    }
}

module.exports = new OpinionsController()