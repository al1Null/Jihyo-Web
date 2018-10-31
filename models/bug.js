const mongoose = require("mongoose");
const bugSchema = mongoose.Schema({
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    name: {
        type: String,
        required: [true, "Please enter your name!"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email!"]
    },
    description: {
        type: String,
        required: [true, "Please enter a description!"]
    }
});

let Bug = mongoose.model("Bug", bugSchema);

module.exports = Bug;