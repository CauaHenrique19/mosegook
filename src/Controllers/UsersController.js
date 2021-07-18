const knex = require('../database/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const aws = require('aws-sdk')

const s3 = new aws.S3()

class UsersControllers{
    async signup(req, res){
        try{
            const { email, password, confirmPassword, name, user, gender, admin } = req.body
    
            if(!email) return res.status(400).json({ message: 'Informe o email por favor!' })
            if(!password) return res.status(400).json({ message: 'Informe a senha por favor!' })
            if(!confirmPassword) return res.status(400).json({ message: 'Informe a confirmação de senha por favor!' })
            if(!name) return res.status(400).json({ message: 'Informe o nome de usuário por favor!' })
            if(!user) return res.status(400).json({ message: 'Informe o user de usuário por favor!' })
            if(!gender) return res.status(400).json({ message: 'Informe o seu gênero por favor!' })

            if(password !== confirmPassword) return res.status(400).json({ message: 'Senhas não compativeis!' })

            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)
    
            const userFinal = { email, password: hash, name, user, gender, key_image_user: req.file.key, url_image: req.file.location, admin: admin ? true : false }

            const userExistsInDb = await knex('users')
                .select('user', 'email')
                .where({ user })
                .orWhere({ email })

            if(userExistsInDb.length >= 1){
                s3.deleteObject({
                    Bucket: 'mosegook',
                    Key: userFinal.key_image_user
                }).promise()
                return res.status(400).json({ message: 'Já existe um usuário com esse user ou email, tente utilizar outro!' })
            }

            const userDb = await knex('users')
                .insert(userFinal, '*')

            delete userDb[0].password
            const token = jwt.sign({ id: userDb[0].id }, process.env.SECRET)

            return res.json({ auth: true, token, userDb })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao criar usuário', error: error.message })
        }
    }
    async login(req, res){
        try{
            const { email, password } = req.body
    
            if(!email) return res.status(400).json({ message: 'Informe o email por favor!' })
            if(!password) return res.status(400).json({ message: 'Informe a senha por favor!' })
    
            const user = await knex('users')
                .select('*')
                .where('email', email)
                .first()
    
            if(!user){
                return res.status(404).json({ auth: false, message: 'Usuário não encontrado.' })
            }
            else{
                if(bcrypt.compareSync(password, user.password)){
                    delete user.password
    
                    const token = jwt.sign({ id: user.id }, process.env.SECRET)
                    return res.json({ auth: true, token, user })
                }
                else{
                    return res.status(400).json({ auth: false, message: 'Senhas não conferem.' })
                }
            }
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao logar', error: error.message })
        }
    }
    async getUser(req, res){
        try{
            const user = req.params.user
    
            const userDB = await knex('users')
                .select('id', 'name', 'user', 'key_image_user', 'url_image')
                .where({ user })
                .first()
    
            if(!userDB) return res.json({ message: 'Esse usuário não existe!' })
    
            const followingDB = await knex('follow')
                .count('id as amount')
                .where({ user_id: userDB.id })
    
            const followersDB = await knex('follow')
                .count('id as amount')
                .where({ following_user_id : userDB.id })
    
            const mediasPreferences = await knex('user_preferences_medias')
                .select('medias.id', 'medias.name', 'medias.url_poster')
                .join('medias', 'medias.id', 'media_id')
                .where({ user_id: userDB.id })
    
            const gendersPreferences = await knex('user_preferences_genders')
                .select('genders.id', 'genders.name', 'genders.color')
                .join('genders', 'genders.id', 'gender_id')
                .where({ user_id: userDB.id })
    
            return res.json({ user: userDB, following_count: followingDB[0], followers_count: followersDB[0], medias: mediasPreferences, genders: gendersPreferences })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar perfil', error: error.message })
        }
    }
    async searchUser(req, res){
        try{
            const user = req.params.search
    
            const users = await knex('users')
                .select('id', 'name', 'user', 'key_image_user', 'url_image')
                .where('user', 'like', `%${user}%`)
    
            return res.json(users)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao procurar usuários', error: error.message })
        }
    }
}

module.exports = new UsersControllers()