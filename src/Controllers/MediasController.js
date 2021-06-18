const knex = require('../database/connection')
const aws = require('aws-sdk')

const s3 = new aws.S3()

class MediasController{
    async create(req, res){
        const { name, synopsis, category_id, avaliation } = req.body
        const { key: key_poster, location: url_poster } = req.files[0]
        const { key: key_poster_timeline, location: url_poster_timeline } = req.files[1]
        
        const media = { name, synopsis, category_id, avaliation, key_poster, url_poster, key_poster_timeline, url_poster_timeline }
        const { genders } = req.body

        const mediaDB = await knex('medias')
            .insert(media, '*')
        
        const objectsToInsert = genders.map(genderId => { return { gender_id: genderId, media_id: mediaDB[0].id }})

        const gendersInMediaInDb = await knex('genders_in_medias')
            .insert(objectsToInsert, 'gender_id')

        const gendersDB = []

        for(let i = 0; i < gendersInMediaInDb.length; i++){
            const data = await knex('genders')
                .select('*')
                .where({ id: gendersInMediaInDb[i] })
                .first()

            gendersDB.push(data)
        }

        mediaDB[0].genders = gendersDB
        res.json(mediaDB)
    }
    async index(req, res){
        const medias = await knex('medias')
            .select('medias.id', 'medias.name', 'medias.synopsis', 
                    'medias.category_id', 'medias.avaliation', 'medias.key_poster',
                    'medias.url_poster', 'medias.key_poster_timeline', 'medias.url_poster_timeline',
                    'categories.name as category_name', 'categories.color as category_color', 'categories.icon as category_icon')
            .join('categories', 'categories.id', 'medias.category_id')

        for(let i = 0; i < medias.length; i++){
            const gendersOfMedias = await knex('genders_in_medias')
                .select('genders_in_medias.gender_id as id', 'genders.name', 'genders.color')
                .join('genders', 'genders.id', 'genders_in_medias.gender_id')
                .where({ media_id: medias[i].id })

            medias[i].genders = gendersOfMedias
        }
        
        res.json(medias)
    }
    async update(req, res){
        
    }
    async delete(req, res){
        const mediaId = req.params.id

        const mediaInDB = await knex('medias')
            .select('key_poster', 'key_poster_timeline')
            .where({ id: mediaId })
            .first()

        const objectsToDelete = Object.values(mediaInDB).map(key => { return { Key: key }})

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
            .catch(err => res.status(500).json({ message: 'Ocorreu um erro inesperado ao deletar uma mídia!' }))
    }
}

module.exports = new MediasController()