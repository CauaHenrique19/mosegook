const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('./config/multer')

const UsersController = require('./Controllers/UsersController')
const GendersController = require('./Controllers/GendersController')
const CategoriesController = require('./Controllers/CategoriesController')
const MediasController = require('./Controllers/MediasController')

routes.post('/signup', multer(multerConfig).single('file'), UsersController.signup)
routes.post('/login', UsersController.login)

routes.get('/genders', GendersController.index)
routes.post('/genders', GendersController.create)
routes.put('/genders/:id', GendersController.update)
routes.delete('/genders/:id', GendersController.delete)

routes.get('/categories', CategoriesController.index)
routes.post('/categories', CategoriesController.create)
routes.put('/categories/:id', CategoriesController.update)
routes.delete('/categories/:id', CategoriesController.delete)

routes.get('/medias', MediasController.index)
routes.post('/medias', multer(multerConfig).any(), MediasController.create)
routes.delete('/medias/:id', MediasController.delete)

module.exports = routes