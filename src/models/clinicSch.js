const mongoose = require('mongoose')


const clinicSchema = new mongoose.Schema({
    person_id:{
        type: String,
    },
    clinic_name: {
        type: String,
        required: true
    },
    doctor_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        minLength: 10,
        maxLength: 10
    },
    address: {
        type: String,
        required: true
    },
    days: [
        {
            type: String
        }
    ]
})

const Clinic = mongoose.model('Clinic', clinicSchema)

module.exports = Clinic