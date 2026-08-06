import mongoose from "mongoose"

const auditSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE'],
        required: true
    },
    author: {
        type: Object,
        required: false,
        default: null
    },
    affectedUser: {
        type: Object,
        required: true
    },
    changes: {
        type: Object,
        required: false,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Audit = mongoose.model('Audit', auditSchema)

export default Audit