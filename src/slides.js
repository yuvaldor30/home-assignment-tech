const express = require('express')
const mongoose = require('mongoose')
const Joi = require("joi")

const router = express.Router()

// Create Models
const { Presentation, presentationSchema } = require('./presentations')

router.use((req, res, next) => {
    req.title = req.title || req.params.title  // Ensure title is set
    next()
})

// ADD
router.post('/', async (req, res) => {

    const { error } = validateSlide(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const title = req.title
    console.log(title)

    try {
        await addSlideToPresentation(title, req.body)
    } catch (err) {
        if (err.message === 'The presentation with the given title was not found') {
            return res.status(404).send(err.message)
        }
        else
            return res.send(err.message)
    }

    return res.send("The slide successfully created and added to presentation")
})

async function addSlideToPresentation(title, slide) {

    const presentation = await Presentation.findOne({ title })
    if (!presentation) throw new Error('The presentation with the given title was not found')

    presentation.slides.push(slide)
    await presentation.save()
}

// DELETE
router.delete('/:index', async (req, res) => {
    const title = req.title
    const presentation = await Presentation.findOne({ title })
    if (!presentation) throw new Error('The presentation with the given title was not found')

    const index = req.params.index
    if (!isNumber(index) || index < 0 || index >= presentation.slides.length)
        return res.status(404).send("The slide with the given index was not found")

    presentation.slides.splice(index, 1)
    await presentation.save()

    return res.send("The slide succuessfully deleted")
})

// update
router.put('/:index', async (req, res) => {
    const { error } = validateSlide(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const title = req.title
    const index = req.params.index

    try {
        await updateSlideToPresentation(title, req.body, index)
    } catch (err) {
        if (err.message === 'The presentation with the given title was not found' || err.message === 'The slide with the given index was not found') {
            return res.status(404).send(err.message)
        }
        else
            return res.send(err.message)
    }

    return res.send('The slide successfully updated')
})

async function updateSlideToPresentation(title, slide, index) {

    const presentation = await Presentation.findOne({ title })
    if (!presentation) throw new Error('The presentation with the given title was not found')

    if (!isNumber(index) || index < 0 || index >= presentation.slides.length)
        throw new Error('The slide with the given index was not found')

    presentation.slides[index] = slide
    await presentation.save()
}


function validateSlide(slide) {
    const schema = Joi.object({
        topic: Joi.string().min(3).required(),
        body: Joi.string().min(3).required(),
    })

    return schema.validate(slide)
}
function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value)
}

module.exports = router