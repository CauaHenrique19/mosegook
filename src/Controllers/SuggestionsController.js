const knex = require('../database/connection')
const { formatDate } = require('../utils/formatDate')

class SuggestionsController{
    async create(req, res){
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
    async index(req, res){
        const suggestions = await knex('suggestions')
            .select('suggestions.*', 'users.name', 'users.user', 'users.url_image')
            .join('users', 'users.id', 'suggestions.user_id')

        suggestions.map(suggestion => suggestion.created_at = formatDate(suggestion.created_at))

        return res.json(suggestions)
    }
    async update(req, res){
        const suggestionId = req.params.id
        const { status } = req.body

        const updatedSuggestion = await knex('suggestions')
            .update({ status }, '*')
            .where({ id: suggestionId })

        updatedSuggestion.map(suggestion => suggestion.created_at = formatDate(suggestion.created_at))

        return res.json(updatedSuggestion)
    }
}

module.exports = new SuggestionsController()