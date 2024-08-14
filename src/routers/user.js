const express = require('express')
const router = new express.Router()
const bodyParser = require('body-parser')
const auth = require('../middleware/auth')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const moment = require('moment')


const User = require('../models/userSch')
const Clinic = require('../models/clinicSch')
const Document = require('../models/docSch')
const { render } = require('ejs')


router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())
router.use(cookieParser())

// -----*** Home Page related routes ***----
router.get('/medilist', (req, res) => {
    res.render('static/idea-stage')
})

router.get('/clinicmanage', (req, res) => {
    res.render('static/clinic-manage')
})

router.get('/presmanage', (req, res) => {
    res.render('static/pres-manage')
})

router.get('/family', (req, res) => {
    res.render('static/taking-care-good')
})
//  --- *** USER related all the pages will be handled here ***---

//  ----------/////// ******* DASHBOARD ******** \\\\\\\ ----------

// --- *** Show the dashboard *** ----
router.get('/dashboard', auth, async (req, res) => {

    try {
        const person_id = req.user._id

        const all_docs = await Document.find({ "person_id": person_id })

        res.render('dashboard', {
            username: req.user.username,
            documents: all_docs,
            moment: moment
        })
    }

    catch (err) {
        // res.status(400).send(err)
        res.render('static/error', {
            reason: 'Dashboard Render Error'
        })
    }
})


//  ----------/////// ******* CLINICS ******** \\\\\\\ ----------

router.get('/clinics', auth, async (req, res) => {
    try {
        const person_id = req.user._id

        const all_clinics = await Clinic.find({ "person_id": person_id })

        res.render('clinics', {
            username: req.user.username,
            clinics: all_clinics,
        })
    }

    catch (err) {
        // res.status(400).send(err)
        res.render('static/error', {
            reason: 'Clinics Render Error'
        })
    }
})


//  ----------/////// ******* SIGN IN, OUT, LOG-OUT ******** \\\\\\\ ----------


//  ----****** Sign Up User ******----
router.post('/signup', async (req, res) => {

    try {
        const pw = req.body.password
        const cpw = req.body.confirmpassword

        if (pw != cpw) {
            // console.log('Passwords are not matching')
            return res.status(400).render('static/no-pass-match')
        }

        const user = new User(req.body)


        // before calling the save method password must be hashed
        const createUser = await user.save()

        res.status(201).render('signup')
    }

    catch (err) {
        // console.log('Error found while sign up' + err)
        // res.status(400).send(err)
        // res.render('error')
        res.render('static/error', {
            reason: 'Error in SignUp'
        })
    }
})


// ********* Sign In User *********
router.post('/signin', async (req, res) => {

    try {
        const email = req.body.email
        const password = req.body.password

        const user = await User.checkLoginDetails(email, password)

        const token = await user.generateAuthToken()

        res.cookie('Medicare', token, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true
        })

        res.status(200).redirect('dashboard')
    }

    catch (error) {
        res.render('static/page404')
    }
})


// *********** Log Out User **************
router.get('/logout', auth, async (req, res) => {
    try {

        // log out from all devices
        req.user.tokens = []

        res.clearCookie('Medicare')

        // console.log('log out success')

        await req.user.save()

        res.status(200).render('home')

    }
    catch (error) {
        // res.status(500).send(error)
        // res.render('error')
        // res.render(404)
        res.render('static/error', {
            reason: 'Error in Logging Out'
        })
    }
})



//  ----------/////// ******* MULTER SETUP ******** \\\\\\\ ----------


// ---- setting up multer storage and call-back function -----
const storage = multer.memoryStorage()

const upload = multer({

    limits: 100000,

    fileFilter(req, file, cb) {

        if (file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|PNG|png)$/)) {
            cb(undefined, true)
        }

        else {
            cb(new Error("Please upload only .jpg file"))
            cb(undefined, false)
        }
    },

    storage
})


//  ----------/////// ******* DOCUMENTS ADDING PAGES ******** \\\\\\\ ----------

router.get('/docadd', auth, (req, res) => {
    res.render('docadd', {
        username: req.user.username
    })
})

router.post('/docadd', auth, upload.single('Prescription'), async (req, res) => {

    try {
        const obj = JSON.parse(JSON.stringify(req.body))

        // req.document 
        req.user.file = req.file.buffer

        obj.person_id = req.user._id

        obj.file = req.file.buffer

        // console.log(obj)

        const doc = new Document(obj)

        const createDoc = await doc.save()

        res.render('docadd', {
            username: req.user.username
        })
    }

    catch (error) {
        // res.render('error')
        // res.status(400).send(error)
        res.render('static/error', {
            reason: 'Error in Adding Document'
        })
    }
})

// -----**** Show the prescription ****----
router.get('/docs/:id', async (req, res) => {
    try {
        const _id = req.params.id

        const pic = await Document.findById(_id)

        res.set("Content-Type", "image/jpg");

        res.send(pic.file)

    } catch (error) {
        // console.log(error)
        res.render('static/page404')
    }
})

// -----**** Delete the prescription ****----
router.post('/docs/delete/:id', auth, async (req, res) => {
    // console.log(req.params.id)

    try {
        const _id = req.params.id

        const doc = await Document.findByIdAndDelete(_id)

        if (!doc)
            return res.status(404).send()

        const person_id = req.user._id

        const all_docs = await Document.find({ "person_id": person_id })

        res.redirect('../../dashboard', {
            username: req.user.username,
            documents: all_docs,
            moment: moment
        }, 201)

    } catch (err) {
        res.render('static/error', {
            reason: 'Error in Deleting Document'
        })
    }
})


//  ----------/////// ******* CLINICS ADDING & DELETING PAGES ******** \\\\\\\ ----------

router.get('/clinicadd', auth, (req, res) => {
    res.render('clinicadd', {
        username: req.user.username
    })
})

router.post('/clinicadd', auth, async (req, res) => {

    try {
        const obj = req.body
        obj.person_id = req.user._id

        // console.log(obj)

        const clinic = new Clinic(req.body)

        const createClinic = await clinic.save()

        res.render('clinicadd', {
            username: req.user.username
        })
    }

    catch (error) {
        // console.log(error)
        // res.status(400).send(error)
        res.render('static/error')
    }
})

router.post('/clinics/delete/:id', auth, async (req, res) => {
    // console.log(req.params.id)

    try {

        const id = req.params.id

        const clinic = await Clinic.findByIdAndDelete(id)

        // console.log(clinic)
        if (!clinic)
            return res.status(404).send()

        // res.render('clinics')
        const person_id = req.user._id

        // console.log(person_id)

        const all_clinics = await Clinic.find({ "person_id": person_id })

        res.redirect('../../clinics', {
            username: req.user.username,
            clinics: all_clinics,
        }, 201)

    } catch (err) {
        // console.log(err)
        // res.status(500).send(err)
        res.render('static/error')
    }

})


// ----**** Delete a particular Clinic *** -----
// we can't make a delete request using pure html
// any request in this route will be treated as a delete request

module.exports = router