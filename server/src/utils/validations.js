const mongoose = require("mongoose")
const ErrorResponse = require("./errorResponse")

const validateId = (id) => {
    if(!mongoose.Types.ObjectId.isValid(id)){
        return false
    }
    return true
} 


module.exports = {validateId}