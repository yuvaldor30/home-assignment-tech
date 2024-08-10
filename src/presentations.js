const express = require('express')
const mongoose = require('mongoose')
const Joi = require("joi")

const router = express.Router()

// Define the Presentation Schema
const presentationSchema = new mongoose.Schema({
    title: { type: String, unique: true },
    authors: [String],
    date: { type: Date, default: Date.now },
    slides: [{ topic: String, body: String }]
})

// Create Models
const Presentation = mongoose.model('Presentation', presentationSchema)

Presentation.syncIndexes()
    .then(() => console.log('Indexes synchronized...'))
    .catch(err => console.error('Error synchronizing indexes:', err))


// ADD
router.post('/', async (req, res) => {
    const { error } = validatePresentation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    try {
        await createPresentation(req.body.title, req.body.authors)
    } catch (err) {
        if (err.message === 'The presentation with the given title already exists.') {
            return res.status(409).send(err.message)
        }
        else
            return res.send('Error saving presentation:', err)
    }

    return res.send("A new presentation successfully created")
})

async function createPresentation(title, authors) {
    const presentation = new Presentation({
        title,
        authors
    })

    try {
        const res = await presentation.save()
    } catch (err) {
        if (err.code === 11000) throw new Error('The presentation with the given title already exists.')
        else console.error('Error saving presentation:', err)
    }
}


// UPDATE
router.put('/:title', async (req, res) => {
    const presentationForValidation = { // Include only the fields required for validation
        title: presentation.title,
        authors: req.body.authors
    }

    const { error } = validatePresentation(presentationForValidation)
    if (error) return res.status(400).send(error.details[0].message)

    try {
        await updatePresentationAuthors(presentation.title, req.body.authors)
    } catch (err) {
        if (err.message === 'The presentation with the given title was not found')
            return res.status(409).send(err.message)
        else
            return res.status(500).send(err.message)
    }

    return res.send("Successfully updated presentation")
})

async function updatePresentationAuthors(title, authors) {
    const presentation = await Presentation.findOne({ title })

    if (!presentation)
        throw new Error('The presentation with the given title was not found')

    presentation.authors = authors
    await presentation.save()
}

// DELETE
router.delete('/:title', async (req, res) => {
    const result = await Presentation.deleteOne({ title: req.params.title })

    if (result.deletedCount == 0) return res.status(404).send("The presentation with the given title was not found")

    return res.send("Presentation succuessfully deleted")
})

// VIEW ONE
router.get('/:title', async (req, res) => {
    const presentation = await Presentation.findOne({ title: req.params.title })

    if (!presentation) return res.status(404).send("The presentation with the given title was not found")

    return res.json(presentation)
})

// VIEW ALL
router.get('/', async (req, res) => {
    const presentation = await Presentation.find()

    return res.json(presentation)
})

function validatePresentation(presentation) {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        authors: Joi.array().items(Joi.string().min(3)).required().min(1)
    })

    return schema.validate(presentation)
}

module.exports = { Presentation, router, presentationSchema }