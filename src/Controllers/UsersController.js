const knex = require('../database/connection')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const aws = require('aws-sdk')

const s3 = new aws.S3()

class UsersControllers{
    async signup(req, res){
        try{
            const { email, password, confirmPassword, name, user, gender, admin } = req.fields

            const userExistsInDb = await knex('users')
                .select('user', 'email')
                .where({ user })
                .orWhere({ email })
            
            if(userExistsInDb.length >= 1){
                return res.status(400).json({ message: 'Já existe um usuário com esse user ou email, tente utilizar outro!' })
            }
            
            if(!email) return res.status(400).json({ message: 'Informe o email por favor!' })
            if(!password) return res.status(400).json({ message: 'Informe a senha por favor!' })
            if(!confirmPassword) return res.status(400).json({ message: 'Informe a confirmação de senha por favor!' })
            if(!name) return res.status(400).json({ message: 'Informe o nome de usuário por favor!' })
            if(!user) return res.status(400).json({ message: 'Informe o user de usuário por favor!' })
            if(!gender) return res.status(400).json({ message: 'Informe o seu gênero por favor!' })
            if(password !== confirmPassword) return res.status(400).json({ message: 'Senhas não compativeis!' })
            
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)
            
            const randomBytes = crypto.randomBytes(16).toString('hex')
            const fileStream = fs.createReadStream(req.files.file.path)
            const fileName = req.files.file.name
            const mimetype = req.files.file.type

            const params = { Bucket: 'mosegook', Key: `${randomBytes}-${fileName}`, Body: fileStream, ContentType: mimetype, ACL: 'public-read' }
            const { Key, Location } = await s3.upload(params).promise()

            const userFinal = { email, password: hash, name, user, gender, key_image_user: Key, url_image: Location, admin: admin ? true : false }

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
    async index(req, res){
        try{
            const users = await knex('users')
                .select('id', 'email', 'name', 'user', 'url_image', 'admin')
    
            return res.json(users)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao pegar usuários', error: error.message })
        }
    }
    async update(req, res){
        try{
            const id = req.params.id
            const { name, biography } = req.body

            const [key_image_user] = await knex('users')
                .update({ name, biography }, 'key_image_user')
                .where({ id })

            if(req.files.image){
                const fileStream = fs.createReadStream(req.files.image.path)
                const mimetype = req.files.image.type
        
                const result = await s3.putObject({Bucket: 'mosegook', Key: key_image_user, Body: fileStream, ContentType: mimetype, ACL: 'public-read'})
                    .promise()
        
                console.log(result)
            }
    
            return res.json({ id, name, biography })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao editar usuário!', error: error.message })
        }
    }
    async getUser(req, res){
        try{
            const user = req.params.user
    
            const userDB = await knex('users')
                .select('id', 'name', 'user', 'key_image_user', 'url_image', 'biography')
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
    async setAdmin(req, res){
        try{
            const { user_id, admin } = req.body

            const userDb = await knex('users')
                .update({ admin }, ['id', 'email', 'user', 'name', 'admin', 'url_image'])
                .where({ id: user_id })

            return res.json(userDb)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao definir admin', error: error.message })
        }
    }
    async rankStatus(req, res){
        try{
            const id = req.params.id
    
            const [{ points }] = await knex('points')
                .sum('quantity as points')
                .where({ user_id: id })
    
            const rank = await knex('ranks')
                .select('id', 'name', 'color', 'value_to_up')
                .whereRaw(`${points} between value_to_enter and value_to_up`)
                .first()
    
            const [nextRank] = await knex('ranks')
                .select('*')
                .whereRaw(`value_to_enter > ${rank.value_to_up}`)
                .limit(1)
    
            const percentualToNextRank = parseInt((points * 100) / nextRank.value_to_enter)
    
            return res.json({ points, rank, percentualToNextRank: `${percentualToNextRank}%`, nextRank })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar status de rank', error: error.message })
        }
    }
    async statistics(req, res){
        try{
            const [amount_users] = await knex('users')
                .count('id as amount_users')
    
            const [amount_admins] = await knex('users')
                .count('id as amount_admins')
                .where({ admin: true })
    
            return res.json({ amount_users: amount_users.amount_users, amount_admins: amount_admins.amount_admins })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar estatísticas de usuários', error: error.message })
        }
    }
}

module.exports = new UsersControllers()