const express = require('express')
const mongoose = require('mongoose')
const Joi = require("joi")


const app = express()
const port = 3000

app.use(express.json())

// Define the Presentation Schema
const presentationSchema = new mongoose.Schema({
    title: { type: String, unique: true },
    authors: [String],
    date: { type: Date, default: Date.now },
    slides: [{ head: String, body: String }]  // Embed the slideSchema as an array
})

// Create Models
const Presentation = mongoose.model('Presentation', presentationSchema)

Presentation.syncIndexes()
    .then(() => console.log('Indexes synchronized'))
    .catch(err => console.error('Error synchronizing indexes:', err))

// Export Models
module.exports = { Presentation }

async function main() {
    await mongoose.connect('mongodb://localhost:27017/test')
    console.log("thank you samyon")
    console.log("lior go to bed")
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.get('/', (req, res) => {
    res.send("Thank you lior, you are useful")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    main().catch(err => console.log(err))
})

app.post('/api/presentations', async (req, res) => {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        authors: Joi.array().items(Joi.string()).required()
    })

    const { error } = schema.validate(req.body)


    if (error) { return res.status(400).send(error.details[0].message) }

    try {
        await createPresentation(req.body.title, req.body.authors)
    } catch (err) {
        if (err.message === 'A presentation with this title already exists.') {
            res.status(409)
            return res.send(err.message)
        }
        else
            return res.send('Error saving presentation:', err)
    }

    res.send("A new presentation successfully created")
})


async function createPresentation(title, authors) {
    const presentation = new Presentation({
        title,
        authors
    })

    try {
        const res = await presentation.save()
        console.log(res)
    } catch (err) {
        if (err.code === 11000) {
            throw new Error('A presentation with this title already exists.')
        } else {
            console.error('Error saving presentation:', err)
        }
    }
}

/*
    Presentation
    Title:String
    Authors List: [String]
    Date of Publishment: date, default:Date.now 
    Slides: [Slide]

    Slide
    head: String
    body: String
*/