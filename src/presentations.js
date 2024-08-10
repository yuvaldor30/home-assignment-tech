const express = require('express')
const mongoose = require('mongoose')
const Joi = require('joi')

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

// Synchronize indexes
Presentation.syncIndexes()
    .then(() => console.log('Indexes synchronized...'))
    .catch(err => console.error('Error synchronizing indexes:', err))

// ADD a new presentation
/**
 * @openapi
 * /api/presentations:
 *   post:
 *     summary: Create a new presentation
 *     requestBody:
 *       description: Presentation object to be created
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Presentation"
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "John Doe"
 *     responses:
 *       200:
 *         description: A new presentation was successfully created
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Conflict, presentation with the given title already exists
 */
router.post('/', async (req, res) => {
    const { error } = validatePresentation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    try {
        await createPresentation(req.body.title, req.body.authors)
    } catch (err) {
        if (err.message === 'The presentation with the given title already exists.') {
            return res.status(409).send(err.message)
        } else {
            return res.send('Error saving presentation:', err)
        }
    }

    return res.send('A new presentation successfully created')
})

// Create a new presentation function
async function createPresentation(title, authors) {
    const presentation = new Presentation({ title, authors })
    try {
        await presentation.save()
    } catch (err) {
        if (err.code === 11000) throw new Error('The presentation with the given title already exists.')
        else console.error('Error saving presentation:', err.message)
    }
}

// UPDATE presentation authors
/**
 * @openapi
 * /api/presentations/{title}:
 *   put:
 *     summary: Update the authors of an existing presentation
 *     parameters:
 *       - name: title
 *         in: path
 *         required: true
 *         description: Title of the presentation to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated authors list
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "Jane Doe"
 *     responses:
 *       200:
 *         description: Presentation successfully updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Presentation not found
 *       500:
 *         description: Server error
 */
router.put('/:title', async (req, res) => {
    const presentation = await Presentation.findOne({ title: req.params.title })
    if (!presentation) return res.status(404).send('The presentation with the given title was not found')

    const presentationForValidation = {
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

    return res.send('Successfully updated presentation')
})

// Update presentation authors function
async function updatePresentationAuthors(title, authors) {
    const presentation = await Presentation.findOne({ title })
    if (!presentation) throw new Error('The presentation with the given title was not found')

    presentation.authors = authors
    await presentation.save()
}

// Delete a presentation
/**
 * @openapi
 * /api/presentations/{title}:
 *   delete:
 *     summary: Delete a presentation
 *     parameters:
 *       - name: title
 *         in: path
 *         required: true
 *         description: Title of the presentation to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Presentation successfully deleted
 *       404:
 *         description: Presentation not found
 */
router.delete('/:title', async (req, res) => {
    const result = await Presentation.deleteOne({ title: req.params.title })
    if (result.deletedCount == 0) return res.status(404).send('The presentation with the given title was not found')

    return res.send('Presentation successfully deleted')
})

// View one presentation
/**
 * @openapi
 * /api/presentations/{title}:
 *   get:
 *     summary: Get a presentation by title
 *     parameters:
 *       - name: title
 *         in: path
 *         required: true
 *         description: Title of the presentation to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Presentation found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 authors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 slides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       topic:
 *                         type: string
 *                       body:
 *                         type: string
 *       404:
 *         description: Presentation not found
 */
router.get('/:title', async (req, res) => {
    const presentation = await Presentation.findOne({ title: req.params.title }, '-_id -__v')
    if (!presentation) return res.status(404).send('The presentation with the given title was not found')


    return res.json(presentation)
})

// View all presentations
/**
 * @openapi
 * /api/presentations:
 *   get:
 *     summary: Get all presentations
 *     responses:
 *       200:
 *         description: List of all presentations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   authors:
 *                     type: array
 *                     items:
 *                       type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   slides:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         topic:
 *                           type: string
 *                         body:
 *                           type: string
 */
router.get('/', async (req, res) => {
    const presentations = await Presentation.find({}, '-_id -__v')
    return res.json(presentations)
})

// Validate presentation function
function validatePresentation(presentation) {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        authors: Joi.array().items(Joi.string().min(3)).required().min(1)
    })

    return schema.validate(presentation)
}

module.exports = { Presentation, router }
