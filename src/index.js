require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const formidable = require('express-formidable')

app.use(cors())
app.use(express.json())
app.use(formidable())
app.use(express.urlencoded({ extended: true }))
app.use(require('./routes'))

app.listen(process.env.PORT || 3001, () => console.log('[BACKEND] Rodando'))