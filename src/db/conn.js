require('dotenv').config()
const mongoose = require('mongoose')
const password = process.env.PASSWORD
mongoose.connect(`mongodb+srv://sapnil1357:${password}@medicare.ernxc.mongodb.net/?retryWrites=true&w=majority&appName=medicare`)
.then( () => {
     console.log('Connection to database successful')
})
.catch( (err) => {
    console.log('Error in making database connection' + err)
}) 