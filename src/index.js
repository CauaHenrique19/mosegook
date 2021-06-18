require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(require('./routes'))

app.listen(3001, () => console.log('[BACKEND] Rodando'))