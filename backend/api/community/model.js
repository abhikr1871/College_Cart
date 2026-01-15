const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    link: { type: String, required: true },
    type: { type: String, enum: ['Note', 'Assignment'], default: 'Note' },
    semester: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderName: { type: String }, // Cache name for easier display
    college: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    createdAt: { type: Date, default: Date.now }
});

const issueSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String, required: true },
    image: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderName: { type: String },
    officialEmail: { type: String }, // For tagging/reporting
    college: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = {
    Resource: mongoose.model('Resource', resourceSchema),
    Issue: mongoose.model('Issue', issueSchema)
};
