const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('./config/multer')

const UsersController = require('./Controllers/UsersController')
const GendersController = require('./Controllers/GendersController')
const CategoriesController = require('./Controllers/CategoriesController')
const MediasController = require('./Controllers/MediasController')
const UserPreferencesGendersController = require('./Controllers/UserPreferencesGendersController')
const UserPreferencesMediasController = require('./Controllers/UserPreferencesMediasController')
const AvaliationsController = require('./Controllers/AvaliationsController')
const FollowController = require('./Controllers/FollowController')
const ComentsController = require('./Controllers/ComentsController')
const LikesController = require('./Controllers/LikesController')

routes.post('/signup', multer(multerConfig).single('file'), UsersController.signup)
routes.post('/login', UsersController.login)
routes.get('/users/:user', UsersController.getUser)
routes.get('/users/search/:search', UsersController.searchUser)

routes.get('/genders', GendersController.index)
routes.post('/genders', GendersController.create)
routes.put('/genders/:id', GendersController.update)
routes.delete('/genders/:id', GendersController.delete)

routes.get('/categories', CategoriesController.index)
routes.post('/categories', CategoriesController.create)
routes.put('/categories/:id', CategoriesController.update)
routes.delete('/categories/:id', CategoriesController.delete)

routes.get('/medias', MediasController.index)
routes.get('/medias/most-rated', MediasController.mostsGoodRated)
routes.get('/medias/statistics/:categoryId', MediasController.statistics)
routes.get('/medias/medias-to-discover/:id', MediasController.mediasToDiscover)
routes.get('/medias-rated-follow/:id', MediasController.mediasRatedForFollow)
routes.get('/medias/:id', MediasController.byCategories)
routes.post('/medias', multer(multerConfig).any(), MediasController.create)
routes.delete('/medias/:id', MediasController.delete)

routes.get('/user-preferences-genders', UserPreferencesGendersController.index)
routes.post('/user-preferences-genders', UserPreferencesGendersController.create)
routes.delete('/user-preferences-genders/:id', UserPreferencesGendersController.delete)

routes.get('/user-preferences-medias', UserPreferencesMediasController.index)
routes.post('/user-preferences-medias', UserPreferencesMediasController.create)
routes.delete('/user-preferences-medias/:id', UserPreferencesMediasController.delete)

routes.get('/avaliations', AvaliationsController.index)
routes.get('/avaliation-detailed/:id', AvaliationsController.detailed)
routes.get('/avaliations-timeline/:id', AvaliationsController.getAvaliationsTimeline)
routes.get('/avaliations/:user', AvaliationsController.getAvaliationsUser)
routes.post('/avaliations', AvaliationsController.create)
routes.delete('/avaliations/:id', AvaliationsController.delete)

routes.get('/coments/:user', ComentsController.getComentUser)
routes.get('/coments-timeline/:id', ComentsController.getComentsTimeline)
routes.post('/coments', ComentsController.create)
routes.delete('/coments/:id', ComentsController.delete)

routes.get('/users-to-follow/:id', FollowController.usersToFollow)
routes.post('/follow', FollowController.create)
routes.delete('/follow', FollowController.delete)

routes.post('/likes/avaliations', LikesController.createLikeAvaliations)
routes.delete('/likes/avaliations/:id', LikesController.deleteLikeAvaliations)
routes.get('/likes/avaliations/user/:userId/:id', LikesController.getLikeAvaliationsPerUser)

module.exports = routes