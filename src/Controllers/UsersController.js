const knex = require('../database/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const aws = require('aws-sdk')

const s3 = new aws.S3()

class UsersControllers{
    async signup(req, res){
        try{
            const { email, password, confirmPassword, name, user, gender } = req.body
    
            if(!email) return res.status(400).json({ message: 'Informe o email por favor!' })
            if(!password) return res.status(400).json({ message: 'Informe a senha por favor!' })
            if(!confirmPassword) return res.status(400).json({ message: 'Informe a confirmação de senha por favor!' })
            if(!name) return res.status(400).json({ message: 'Informe o nome de usuário por favor!' })
            if(!user) return res.status(400).json({ message: 'Informe o user de usuário por favor!' })
            if(!gender) return res.status(400).json({ message: 'Informe o seu gênero por favor!' })
    
            if(password !== confirmPassword) return res.status(400).json({ message: 'Senhas não compativeis!' })
    
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)
    
            const userFinal = { email, password: hash, name, user, gender, key_image_user: req.file.key, url_image: req.file.location, admin: true }

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
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao criar usuário' })
        }
    }
    async login(req, res){
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
}

module.exports = new UsersControllers()