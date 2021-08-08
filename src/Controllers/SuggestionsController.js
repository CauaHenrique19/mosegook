const { response } = require('express')
const knex = require('../database/connection')
const { formatDate } = require('../utils/formatDate')

class SuggestionsController{
    async create(req, res){
        try{
            const { media_name, user_id } = req.body
    
            const suggestion = {
                media_name,
                user_id,
                status: 'pending',
                created_at: new Date()
            }
    
            const suggestionDb = await knex('suggestions')
                .insert(suggestion, '*')
    
            suggestionDb.map(suggestion => suggestion.created_at = formatDate(suggestion.created_at))
    
            return res.json(suggestionDb)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao sugerir uma mídia!', error: error.message })
        }
    }
    async index(req, res){
        try{
            const suggestions = await knex('suggestions')
                .select('suggestions.*', 'users.name', 'users.user', 'users.url_image')
                .join('users', 'users.id', 'suggestions.user_id')
    
            suggestions.map(suggestion => suggestion.created_at = formatDate(suggestion.created_at))
    
            return res.json(suggestions)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao buscar sugestões!', error: error.message })
        }
    }
    async update(req, res){
        try{
            const suggestionId = req.params.id
            const { status } = req.body
    
            const updatedSuggestion = await knex('suggestions')
                .update({ status }, '*')
                .where({ id: suggestionId })
    
            updatedSuggestion.map(suggestion => suggestion.created_at = formatDate(suggestion.created_at))
    
            return res.json(updatedSuggestion)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro ao atualizar uma mídia!', error: error.message })
        }
    }
}

module.exports = new SuggestionsController()