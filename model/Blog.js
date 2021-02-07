const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    userId: {
        type: Number,
        required: true
    },
}, 
{ 
    timestamps: true, 
    versionKey: false 
});

mongoose.model('Blog', blogSchema);