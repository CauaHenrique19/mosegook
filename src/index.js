require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const formidable = require('express-formidable')

app.use(cors())
app.use(formidable())
app.use((req, res, next) => {
    req.body = req.fields
    next()
})
app.use(require('./routes'))

app.listen(process.env.PORT || 3001, () => console.log('[BACKEND] Rodando'))