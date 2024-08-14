const express = require('express')
const router = new express.Router()
const bodyParser = require('body-parser')
const auth = require('../middleware/auth')
const cookieParser = require('cookie-parser')

const Document = require('../models/docSch')

router.use(express.json())
router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())
router.use(cookieParser())


router.post('/docadd', auth, (req, res) => {
    console.log(req.body)
    res.redirect('/docadd')
})