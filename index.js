require('./src/db/conn')
require('dotenv').config()
const express = require('express')
const userRouter = require('./src/routers/user')
const bodyParser = require('body-parser')


const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.static('public'))
app.use(express.json())
app.use(userRouter)
app.use(bodyParser.json());

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.listen(port, () => {
    console.log(`Server is up & running on port ${port}`)
})
