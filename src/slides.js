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
/**
 * @openapi
 * /api/presentations/{title}/slides:
 *   post:
 *     summary: Add a new slide to a presentation
 *     parameters:
 *       - name: title
 *         in: path
 *         required: true
 *         description: The title of the presentation to which the slide will be added
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Slide object to be added to the presentation
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "Introduction"
 *               body:
 *                 type: string
 *                 example: "This is the introduction slide."
 *     responses:
 *       200:
 *         description: The slide was successfully created and added to the presentation
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Presentation not found
 */
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
/**
 * @openapi
 * /api/presentations/{title}/slides/{index}:
 *   delete:
 *     summary: Delete a slide from a presentation by index
 *     parameters:
 *       - name: title
 *         in: path
 *         required: true
 *         description: The title of the presentation from which the slide will be deleted
 *         schema:
 *           type: string
 *       - name: index
 *         in: path
 *         required: true
 *         description: The index of the slide to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The slide was successfully deleted
 *       404:
 *         description: Slide or presentation not found
 */
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
/**
 * @openapi
 * /api/presentations/{title}/slides/{index}:
 *   put:
 *     summary: Update a slide in a presentation by index
 *     parameters:
 *       - name: title
 *         in: path
 *         required: true
 *         description: The title of the presentation containing the slide
 *         schema:
 *           type: string
 *       - name: index
 *         in: path
 *         required: true
 *         description: The index of the slide to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Updated slide object
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "Updated Topic"
 *               body:
 *                 type: string
 *                 example: "Updated slide body content."
 *     responses:
 *       200:
 *         description: The slide was successfully updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Slide or presentation not found
 */
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
