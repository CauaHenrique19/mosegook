const knex = require('../database/connection')
const crypto = require('crypto')
const fs = require('fs')
const aws = require('aws-sdk')
const { formatDate } = require('../utils/formatDate')

const s3 = new aws.S3()

class MediasController {
    async create(req, res) {
        try{
            const { name, synopsis, category_id, avaliation } = req.body
            const genders = JSON.parse(req.body.genders)

            const filesArray = Object.entries(req.files)
            
            const returnsUploads = await Promise.all(filesArray.map(async (file) => {
                file.shift()
                const randomBytes = crypto.randomBytes(16).toString('hex')
                const fileStream = fs.createReadStream(file[0].path)
                const fileName = file[0].name
                const mimetype = file[0].type
                
                const params = { Bucket: 'mosegook', Key: `${randomBytes}-${fileName}`, Body: fileStream, ContentType: mimetype, ACL: 'public-read' }
                const { Key, Location } = await s3.upload(params).promise()
                
                return { Key, Location }
            }))

            const media = { 
                name, synopsis, category_id, avaliation, 
                key_poster: returnsUploads[0].Key, 
                url_poster: returnsUploads[0].Location, 
                key_poster_timeline: returnsUploads[1].Key, 
                url_poster_timeline: returnsUploads[1].Location
            }

            const mediaDB = await knex('medias')
                .insert(media, '*')
    
            const objectsToInsert = genders.map(genderId => ({gender_id: genderId, media_id: mediaDB[0].id }))

            const gendersInMediaInDb = await knex('genders_in_medias')
                .insert(objectsToInsert, 'gender_id')
    
            const gendersDB = []
    
            for (let i = 0; i < gendersInMediaInDb.length; i++) {
                const data = await knex('genders')
                    .select('*')
                    .where({ id: gendersInMediaInDb[i] })
                    .first()
    
                gendersDB.push(data)
            }
    
            mediaDB[0].genders = gendersDB
            res.json(mediaDB)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao criar mídia', error: error.message })
        }
    }
    async index(req, res) {
        try{
            const medias = await knex('medias')
                .select('medias.id', 'medias.name', 'medias.synopsis',
                    'medias.category_id', 'medias.avaliation', 'medias.key_poster',
                    'medias.url_poster', 'medias.key_poster_timeline', 'medias.url_poster_timeline',
                    'categories.name as category_name', 'categories.color as category_color', 'categories.icon as category_icon')
                .join('categories', 'categories.id', 'medias.category_id')
                .orderBy('id')
    
            for (let i = 0; i < medias.length; i++) {
                const gendersOfMedias = await knex('genders_in_medias')
                    .select('genders_in_medias.id as genders_in_medias_id', 'genders_in_medias.gender_id as id', 'genders.name', 'genders.color')
                    .join('genders', 'genders.id', 'genders_in_medias.gender_id')
                    .where({ media_id: medias[i].id })
    
                medias[i].genders = gendersOfMedias
            }
    
            res.json(medias)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar mídias', error: error.message })
        }
    }
    async update(req, res){
        try{
            const mediaId = req.params.id
            const { id, name, synopsis, category_id, avaliation } = req.body
    
            const genders = JSON.parse(req.body.genders)
            const media = { id, name, synopsis, category_id, avaliation }
    
            const mediaInDb = await knex('medias')
                .select('key_poster', 'key_poster_timeline')
                .where({ id: mediaId })
                .first()
    
            await knex('genders_in_medias')
                .delete()
                .where({ media_id: mediaId })
    
            const updatedMedia = await knex('medias')
                .update(media, '*')
                .where({ id: mediaId })
    
            const gendersToInsert = genders.map(genderId => ({gender_id: genderId, media_id: mediaId }))

            const gendersUpdated =  await knex('genders_in_medias')
                .insert(gendersToInsert, ['media_id', 'gender_id'])

            for(let i = 0; i < gendersUpdated.length; i++){
                const gender = await knex('genders')
                    .select('name', 'color')
                    .where({ id: gendersUpdated[i].gender_id })
                    .first()

                gendersUpdated[i] = {...gendersUpdated[i], ...gender}
            }
            
            updatedMedia[0].genders = gendersUpdated

            if(req.files){
                const fields = [
                    { poster: 'key_poster' },
                    { poster_timeline: 'key_poster_timeline' }
                ]
                  
                const arrayFiles = Object.entries(req.files)
                
                arrayFiles.map(async (file) => {
                    
                    const imageName = file[0]
                    const field = fields.find(field => field[imageName])[imageName]
                    const key = mediaInDb[field]
                    
                    const filepath = file[1].path
                    const mimetype = file[1].type
                    const fileStream = fs.createReadStream(filepath);
                    
                    const result = await s3.putObject({Bucket: 'mosegook',Key: key,Body: fileStream, ContentType: mimetype, ACL: 'public-read'})
                        .promise()
                    
                    console.log(result)
                }) 
            }
            return res.json(updatedMedia)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao editar mídia', error: error.message })
        }
    }
    async byCategories(req, res) {
        try{
            const categoryId = req.params.id
    
            const medias = await knex('medias')
                .select('medias.id', 'medias.name', 'medias.synopsis',
                    'medias.category_id', 'medias.avaliation', 'medias.key_poster',
                    'medias.url_poster', 'medias.key_poster_timeline', 'medias.url_poster_timeline',
                    'categories.name as category_name', 'categories.color as category_color', 'categories.icon as category_icon')
                .join('categories', 'categories.id', 'medias.category_id')
                .orderBy('id')
                .where({ category_id: categoryId })
    
            for (let i = 0; i < medias.length; i++) {
                if (medias) {
                    const gendersOfMedias = await knex('genders_in_medias')
                        .select('genders_in_medias.id as genders_in_medias_id', 'genders_in_medias.gender_id as id', 'genders.name', 'genders.color')
                        .join('genders', 'genders.id', 'genders_in_medias.gender_id')
                        .where({ media_id: medias[i].id })
                    medias[i].genders = gendersOfMedias
                }
            }
    
            res.json(medias)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar mídias', error: error.message })
        }
    }
    async statistics(req, res) {
        try{
            const categoryId = req.params.categoryId
    
            const mostRated = await knex('avaliations')
                .select('medias.name')
                .count('avaliations.media_id as amount_avaliations')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .where({ category_id: categoryId })
                .groupBy('media_id', 'medias.name')
                .orderBy('amount_avaliations', 'DESC')
                .limit(1)
    
            const amountAvaliations = await knex('avaliations')
                .select('medias.category_id')
                .count('medias.category_id as amount_avaliations')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .where({ category_id: categoryId })
                .groupBy('medias.category_id', 'category_id')
    
            const mostGoodRated = await knex.raw(`
                select
                    to_char(avg(avaliations.stars), 'FM999999999.0') as media_stars,
                    medias.name
                from avaliations
                inner join medias on medias.id = avaliations.media_id
                where medias.category_id = ${categoryId}
                group by 
                    avaliations.media_id, medias.name
                order by media_stars DESC 
                limit 1;`)
    
            return res.json({ mostRated, amountAvaliations, mostGoodRated: mostGoodRated.rows })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar estatísticas', error: error.message })
        }
    }
    async mediasToDiscover(req, res) {
        try {
            const userId = req.params.id

            const gendersPreferences = await knex('user_preferences_genders')
                .select('*')
                .where({ user_id: userId })

            const gendersWhereComand = gendersPreferences.map((gender, index) => {
                return index === 0 ? `genders_in_medias.gender_id = ${gender.gender_id} ` : `and not genders_in_medias.gender_id = ${gender.gender_id} `
            }).join('')

            const medias = await knex.raw(`
                select distinct on (category_id)
                    medias.*
                from medias
                inner join genders_in_medias on genders_in_medias.media_id = medias.id
                where not ${gendersWhereComand}
                group by medias.id
                order by category_id, random();
            `)

            for (let i = 0; i < medias.rows.length; i++) {
                const genderOfMedia = await knex('genders_in_medias')
                    .select('genders.*')
                    .join('genders', 'genders.id', 'genders_in_medias.gender_id')
                    .where({ media_id: medias.rows[i].id })

                medias.rows[i].genders = genderOfMedia
            }
            return res.json({ medias: medias.rows })
        }
        catch (error) {
            return res.json({ message: 'Ocorreu um erro ao tentar buscar mídias pra você! Provavelmente você não selecionou gêneros da sua preferência.' })
        }

    }
    async mediasRatedForFollow(req, res) {
        try{
            const userId = req.params.id
    
            const userFollowing = await knex('follow')
                .select('following_user_id')
                .where({ user_id: userId })
    
            if (userFollowing.length > 0) {
                const whereComand = userFollowing
                    .map((user, index) => index === 0 ? `avaliations.user_id = ${user.following_user_id} ` : `or avaliations.user_id = ${user.following_user_id} `)
                    .join('')
    
                const mediasDB = await knex.raw(`
                    select distinct on (media_id)
                    avaliations.media_id,
                    medias.url_poster_timeline,
                    medias.name,
                    medias.avaliation
                    from avaliations
                    inner join medias on medias.id = avaliations.media_id
                    where ${whereComand}`)
    
                for (let i = 0; i < mediasDB.rows.length; i++) {
                    const genders = await knex('genders_in_medias')
                        .select('genders.name', 'genders.color')
                        .join('genders', 'genders.id', 'genders_in_medias.gender_id')
                        .where({ media_id: mediasDB.rows[i].media_id })
    
                    mediasDB.rows[i].genders = genders
                }
    
                return res.json({ medias: mediasDB.rows })
            }
            else {
                const mediasDB = await knex.raw(`select medias.id, medias.name, medias.url_poster_timeline, medias.avaliation from medias order by random() limit 5;`)
    
                for (let i = 0; i < mediasDB.rows.length; i++) {
                    const genders = await knex('genders_in_medias')
                        .select('genders.name', 'genders.color')
                        .join('genders', 'genders.id', 'genders_in_medias.gender_id')
                        .where({ media_id: mediasDB.rows[i].id })
    
                    mediasDB.rows[i].genders = genders
                }
    
                return res.json({ medias: mediasDB.rows })
            }
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar mídias avaliadas por seguidores', error: error.message })
        }
    }
    async mostsGoodRated(req, res) {
        try{
            const medias = await knex.raw(`
                select 
                    medias.id,
                    to_char(avg(stars), 'FM999999999.0') as average,
                    medias.name,
                    medias.url_poster
                from avaliations
                inner join medias on medias.id = avaliations.media_id
                group by 
                    medias.id, 
                    medias.name, 
                    medias.url_poster
                order by average DESC
                limit 15;`)
                
            return res.json({ medias: medias.rows })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar mídias mais bem avaliadas', error: error.message })
        }
    }
    async detailed(req, res){
        try{
            const id = req.params.id
    
            const mediaDb = await knex('medias')
                .select('id', 'name', 'url_poster', 'url_poster_timeline', 'avaliation', 'synopsis')
                .where({ id })
                .first()
    
            const genders = await knex('genders_in_medias')
                .select('gender_id', 'genders.name', 'genders.color')
                .join('genders', 'genders.id', 'gender_id')
                .where({ media_id: id })
                
            const gendersWhereString = genders
                .map((gender, index) => index === 0 ? `gender_id = ${gender.gender_id}` : ` or gender_id = ${gender.gender_id}`)
                .join('')
    
            const avaliations = await knex('likes_in_avaliations')
                .select('avaliation_id', 'avaliations.content', 'avaliations.created_at',
                        'avaliations.user_id', 'avaliations.media_id', 'medias.name as media_name', 
                        'users.user as user_user', 'users.name as user_name', 'categories.color as category_color', 'categories.icon as category_icon')
                .count('avaliation_id as amountLikes')
                .join('avaliations', 'avaliations.id', 'avaliation_id')
                .join('medias', 'medias.id', 'avaliations.media_id')
                .join('users', 'users.id', 'avaliations.user_id')
                .join('categories', 'categories.id', 'medias.category_id')
                .where('medias.id', id)
                .groupBy('avaliation_id', 'avaliations.content', 'avaliations.created_at', 
                        'avaliations.user_id', 'avaliations.media_id', 'media_name',
                        'user_user', 'user_name', 'category_color', 'category_icon')
                .orderBy('amountLikes', 'DESC')
                .limit(6)
    
            for(let i = 0; i < avaliations.length; i++){
                const { count: amount_coments } = await knex('coments')
                    .count('avaliation_id')
                    .where({ avaliation_id: avaliations[i].avaliation_id })
                    .first()
    
                avaliations[i].created_at = formatDate(avaliations[i].created_at)
                avaliations[i].amountComents = amount_coments
            }
    
            const { rows: relationedMediasDb } = await knex.raw(`
                select distinct on (media_id)
                    media_id,
                    gender_id,
                    name,
                    url_poster
                from genders_in_medias
                inner join medias on medias.id = media_id
                where ${gendersWhereString}
                order by media_id;
            `)

            const mediaIndex = relationedMediasDb.indexOf(relationedMediasDb.find(media => media.name === mediaDb.name))
            relationedMediasDb.splice(mediaIndex, 1)

            const relationedMedias = [...relationedMediasDb]

            const mediaDetailed = {
                media: mediaDb,
                genders,
                avaliations: {
                    first_row: avaliations.slice(0, 3),
                    second_row: avaliations.slice(3, 6)
                },
                relationedMedias
            }
    
            res.json(mediaDetailed)
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar mídia detalhada', error: error.message })
        }
    }
    async search(req, res){
        try{
            const search = req.params.search.toLowerCase()

            const { rows: medias } = await knex
                .raw(`
                    select 
                        medias.id, medias.name, medias.url_poster, 
                        medias.url_poster_timeline, categories.color, categories.icon
                    from medias
                    inner join categories on categories.id = medias.category_id
                    where lower(medias.name) like '%${search}%';`)
    
            for(let i = 0; i < medias.length; i++){
                const gendersOfMedia = await knex('genders_in_medias')
                    .select('genders_in_medias.gender_id', 'genders.name', 'genders.color')
                    .join('genders', 'genders.id', 'genders_in_medias.gender_id')
                    .where({ media_id : medias[i].id })
    
                medias[i].genders = gendersOfMedia
            }
    
            return res.json({ medias })
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao buscar mídias pelo nome', error: error.message })
        }
    }
    async delete(req, res) {
        try{
            const mediaId = req.params.id
    
            const mediaInDB = await knex('medias')
                .select('key_poster', 'key_poster_timeline')
                .where({ id: mediaId })
                .first()
    
            const objectsToDelete = Object.values(mediaInDB).map(key => { return { Key: key } })
    
            s3.deleteObjects({
                Bucket: 'mosegook',
                Delete: {
                    Objects: objectsToDelete
                }
            }).promise()
    
            await knex('genders_in_medias')
                .delete()
                .where({ media_id: mediaId })
    
            knex('medias')
                .delete()
                .where({ id: mediaId })
                .then(_ => res.json({ message: 'Mídia Excluida com sucesso!' }))
                .catch(err => res.status(500).json({ message: 'Ocorreu um erro inesperado ao deletar uma mídia!', error: err.message }))
        }
        catch(error){
            return res.status(500).json({ message: 'Ocorreu um erro inesperado ao deletar mídia', error: error.message })
        }
    }
}

module.exports = new MediasController()