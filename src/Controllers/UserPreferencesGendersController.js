const knex = require('../database/connection')

class UserPreferencesGendersController{
    async create(req, res){
        const { user_id, gender_id } = req.body

        if(!user_id) return res.status(400).json({ message: 'Informe o id do usuário' })
        if(!gender_id) return res.status(400).json({ message: 'Informe o id do usuário' })

        const objectsToInsert = gender_id.map(gender => { return { user_id, gender_id: gender } })

        const genderPreferencesDB = await knex('user_preferences_genders')
            .insert(objectsToInsert, '*')

        return res.json(genderPreferencesDB)
    }
    async index(req, res){
        const { user_id } = req.body

        if(!user_id) return res.status(400).json({ message: 'Informe o id do usuário' })

        const gendersPreference = await knex('user_preferences_genders')
            .select('user_preferences_genders.id', 'user_preferences_genders.user_id', 'user_preferences_genders.gender_id', 'genders.name', 'genders.color')
            .join('genders', 'user_preferences_genders.gender_id', 'genders.id')
            .where({ user_id })

        return res.json(gendersPreference)
    }
    async delete(req, res){
        const userPreferenceId = req.params.id

        knex('user_preferences_genders')
            .delete()
            .where({ id: userPreferenceId })
            .then(() => res.json({ message: 'Preferência excluída com sucesso!' }))
            .catch(error => res.status(500).json({ message: 'Ocorreu um erro inesperado ao tentar excluir preferência', error: error.message }))
    }
}

module.exports = new UserPreferencesGendersController()