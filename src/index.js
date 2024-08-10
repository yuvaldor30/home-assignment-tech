const express = require('express')
const mongoose = require('mongoose')
const Joi = require('joi')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const app = express()
const port = 3000

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Presentation Platform API',
            version: '1.0.0',
            description: 'API documentation for the Presentation Platform',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./src/*.js'], // Path to the API specs
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Middleware to parse JSON bodies
app.use(express.json())

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const { router: presentations } = require('./presentations')
const slides = require('./slides')

// Route for presentations
/**
 * @openapi
 * /api/presentations:
 *   get:
 *     summary: Retrieve a list of presentations
 *     responses:
 *       200:
 *         description: A list of presentations
 */
app.use('/api/presentations', presentations)

// Route for slides associated with a presentation
/**
 * @openapi
 * /api/presentations/{title}/slides:
 *   get:
 *     summary: Retrieve a list of slides for a specific presentation
 *     parameters:
 *       - name: title
 *         in: path
 *         required: true
 *         description: The title of the presentation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of slides for the specified presentation
 */
app.use('/api/presentations/:title/slides', (req, res, next) => {
    req.title = req.params.title
    next()
}, slides)

// Connect to MongoDB and start the server
async function main() {
    await mongoose.connect('mongodb://localhost:27017/test')
    console.log('Connected to database...')
}

app.get('/', (req, res) => {
    res.send('Home Assignment: Server-Side Service Development for Presentation Platform')
})

app.listen(port, () => {
    console.log(`Application listening on port ${port}...`)
    main().catch(err => console.log(err))
})
