require('dotenv').config()
const express = require('express')
const router = express.Router()
const Replicate = require('replicate')
const multer = require('multer')
const fs = require('fs')

const upload = multer({ dest: 'uploads/' })
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const STYLES = {
    moderne:     'modern interior design, contemporary furniture, clean lines, minimalist, photorealistic, 4k',
    marocain:    'moroccan traditional interior design, zellige tiles, warm colors, riad style, photorealistic, 4k',
    minimaliste: 'minimalist interior design, white walls, simple furniture, zen atmosphere, photorealistic, 4k',
    scandinave:  'scandinavian interior design, natural wood, cozy, nordic style, photorealistic, 4k',
}

router.post('/generate', upload.single('image'), async (req, res) => {
    try {
        const { style } = req.body
        if (!req.file) return res.status(400).json({ error: 'Image manquante' })
        if (!STYLES[style]) return res.status(400).json({ error: 'Style invalide' })

        const imageBuffer = fs.readFileSync(req.file.path)
        const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`

        const output = await replicate.run(
            "melgor/stabledesign_interiordesign:5e13482ea317670bfc797bb18bace359860a721a39b5bbcaa1ffcd241d62bca0",
            {
                input: {
                    image_base: base64Image,
                    prompt: STYLES[style],
                    negative_prompt: 'ugly, blurry, low quality, distorted, deformed',
                }
            }
        )

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }

        let imageUrl
        if (output && typeof output.url === 'function') {
            imageUrl = output.url()
        } else if (Array.isArray(output)) {
            imageUrl = output[0]
        } else {
            imageUrl = output
        }

        res.json({ imageUrl })

    } catch (err) {
        console.error('Erreur Replicate:', err.message)
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        res.status(500).json({ error: err.message })
    }
})

module.exports = router