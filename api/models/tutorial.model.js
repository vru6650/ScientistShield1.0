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
            unique: true,
        },
        // NEW: Field to define the content type of the chapter
        contentType: {
            type: String,
            enum: ['text', 'code-interactive', 'quiz'],
            default: 'text',
        },
        // Content for 'text' and 'quiz' chapters
        content: {
            type: String,
            required: true,
        },
        // NEW: Initial code for 'code-interactive' chapters
        initialCode: {
            type: String,
            default: '',
        },
        // NEW: ID to link to a separate quiz document for 'quiz' chapters
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
        },
        order: {
            type: Number,
            required: true,
        },
        // NEW: Array to track which users have completed this chapter
        completedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: [],
        }],
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
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            default: 'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
        },
        category: {
            type: String,
            default: 'uncategorized',
        },
        authorId: {
            type: String,
            required: true,
        },
        chapters: [tutorialChapterSchema],
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        readingTime: {
            type: Number,
            default: 0,
        },
        completedBy: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },
    },
    { timestamps: true }
);

const Tutorial = mongoose.model('Tutorial', tutorialSchema);

export default Tutorial;