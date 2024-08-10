const express = require('express')
const mongoose = require('mongoose')
const Joi = require("joi")

const app = express()
const port = 3000

app.use(express.json())

const { router: presentations } = require('./presentations')
const slides = require('./slides')
app.use('/api/presentations', presentations)
app.use('/api/presentations/:title/slides', (req, res, next) => {
    req.title = req.params.title
    next()
}, slides)


async function main() {
    await mongoose.connect('mongodb://localhost:27017/test')
    console.log("Connected to database...")
}

app.get('/', (req, res) => {
    res.send("Home Assignment: Server-Side Service Development for Presentation Platform")
})

app.listen(port, () => {
    console.log(`Application listening on port ${port}...`)
    main().catch(err => console.log(err))
})