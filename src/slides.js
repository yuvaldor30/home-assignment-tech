const express = require('express')
const mongoose = require('mongoose')
const Joi = require('joi')

const router = express.Router()

// Import Presentation model from presentations.js
const { Presentation } = require('./presentations')

// Middleware to ensure title is set
router.use((req, res, next) => {
    req.title = req.title || req.params.title
    next()
})

// ADD a new slide to a presentation
router.post('/', async (req, res) => {
    const { error } = validateSlide(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const title = req.title

    try {
        await addSlideToPresentation(title, req.body)
    } catch (err) {
        if (err.message === 'The presentation with the given title was not found') {
            return res.status(404).send(err.message)
        } else {
            return res.send(err.message)
        }
    }

    return res.send('The slide successfully created and added to presentation')
})

// Add slide to presentation function
async function addSlideToPresentation(title, slide) {
    const presentation = await Presentation.findOne({ title })
    if (!presentation) throw new Error('The presentation with the given title was not found')

    presentation.slides.push(slide)
    await presentation.save()
}

// Delete a slide from a presentation by index
router.delete('/:index', async (req, res) => {
    const title = req.title
    const presentation = await Presentation.findOne({ title })
    if (!presentation) throw new Error('The presentation with the given title was not found')

    const index = req.params.index
    if (!isNumber(index) || index < 0 || index >= presentation.slides.length)
        return res.status(404).send('The slide with the given index was not found')

    presentation.slides.splice(index, 1)
    await presentation.save()

    return res.send('The slide successfully deleted')
})

// UPDATE a slide in a presentation by index
router.put('/:index', async (req, res) => {
    const { error } = validateSlide(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const title = req.title
    const index = req.params.index

    try {
        await updateSlideInPresentation(title, req.body, index)
    } catch (err) {
        if (err.message === 'The presentation with the given title was not found' || err.message === 'The slide with the given index was not found') {
            return res.status(404).send(err.message)
        } else {
            return res.send(err.message)
        }
    }

    return res.send('The slide successfully updated')
})

// Update slide in presentation function
async function updateSlideInPresentation(title, slide, index) {
    const presentation = await Presentation.findOne({ title })
    if (!presentation) throw new Error('The presentation with the given title was not found')

    if (!isNumber(index) || index < 0 || index >= presentation.slides.length)
        throw new Error('The slide with the given index was not found')

    presentation.slides[index] = slide
    await presentation.save()
}

// Validate slide function
function validateSlide(slide) {
    const schema = Joi.object({
        topic: Joi.string().min(3).required(),
        body: Joi.string().min(3).required(),
    })

    return schema.validate(slide)
}

// Check if value is a number function
function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value)
}

module.exports = router
