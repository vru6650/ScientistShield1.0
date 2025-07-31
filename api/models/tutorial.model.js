import mongoose from 'mongoose';

const tutorialChapterSchema = new mongoose.Schema(
    {
        chapterTitle: {
            type: String,
            required: true,
        },
        chapterSlug: {
            type: String,
            required: true,
            unique: true, // Chapters should have unique slugs within a tutorial
        },
        content: { // Rich text content for the chapter, similar to post content
            type: String,
            required: true,
        },
        order: { // To define the order of chapters in a tutorial
            type: Number,
            required: true,
        },
        // You can add other fields specific to a chapter, e.g., code examples, images
    },
    { timestamps: true }
);

const tutorialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        slug: { // Main tutorial slug
            type: String,
            required: true,
            unique: true,
        },
        description: { // Short description of the tutorial
            type: String,
            required: true,
        },
        thumbnail: { // Image for tutorial overview/card
            type: String,
            default: 'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
        },
        category: { // e.g., 'JavaScript', 'React', 'Node.js'
            type: String,
            default: 'uncategorized',
        },
        authorId: { // Link to the User model
            type: String, // Or mongoose.Schema.Types.ObjectId, ref: 'User'
            required: true,
        },
        // Embedded chapters directly in the tutorial model for simpler fetching
        chapters: [tutorialChapterSchema],
    },
    { timestamps: true }
);

const Tutorial = mongoose.model('Tutorial', tutorialSchema);

export default Tutorial;