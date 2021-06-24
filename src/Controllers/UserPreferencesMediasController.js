const knex = require("../database/connection")

class UserPreferencesMediasController{
    async create(req, res){
        const { user_id, media_id } = req.body

        if(!user_id) return res.status(400).json({ message: 'Informe o id do usuário' })
        if(!media_id) return res.status(400).json({ message: 'Informe o id da mídia' })

        const objectsToInsert = media_id.map(media => { return { user_id, media_id: media } })

        const mediasPreferenceDb = await knex('user_preferences_medias')
            .insert(objectsToInsert, '*')

        return res.json(mediasPreferenceDb)
    }
    async index(req, res){
        const { user_id } = req.body

        if(!user_id) return res.status(400).json({ message: 'Informe o id do usuário' })

        const mediasPreferences = await knex('user_preferences_medias')
            .select('user_preferences_medias.id', 'user_preferences_medias.user_id', 'medias.name')
            .join('medias', 'user_preferences_medias.media_id', 'medias.id')
            .where({ user_id })

        return res.json(mediasPreferences)
    }
    delete(req, res){
        const userPreferenceId = req.params.id

        knex('user_preferences_medias')
            .delete()
            .where({ id: userPreferenceId })
            .then(() => res.json({ message: 'Preferência excluída com sucesso!' }))
            .catch(error => res.status(500).json({ message: 'Ocorreu um erro inesperado ao tentar excluir preferência', error: error.message }))
    }
}

module.exports = new UserPreferencesMediasController()