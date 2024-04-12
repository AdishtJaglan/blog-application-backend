const mongoose = require("mongoose");
const { Schema } = mongoose;

const BlogSchema = new Schema({
    blog: {
        type: String,
        required: true,
    },
    poster: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

module.exports = mongoose.model("Blog", BlogSchema);