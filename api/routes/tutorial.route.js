import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
    createTutorial,
    getTutorials,
    updateTutorial,
    deleteTutorial,
    addChapter,
    updateChapter,
    deleteChapter,
    markChapterAsComplete // NEW: Import the new controller function
} from '../controllers/tutorial.controller.js';

const router = express.Router();

// Tutorial CRUD operations (admin-only)
router.post('/create', verifyToken, createTutorial);
router.get('/gettutorials', getTutorials);
router.get('/getsingletutorial/:tutorialSlug', (req, res, next) => {
    req.query.slug = req.params.tutorialSlug;
    getTutorials(req, res, next);
});
router.put('/update/:tutorialId/:userId', verifyToken, updateTutorial);
router.delete('/delete/:tutorialId/:userId', verifyToken, deleteTutorial);

// Chapter operations (admin-only)
router.post('/addchapter/:tutorialId/:userId', verifyToken, addChapter);
router.put('/updatechapter/:tutorialId/:chapterId/:userId', verifyToken, updateChapter);
router.delete('/deletechapter/:tutorialId/:chapterId/:userId', verifyToken, deleteChapter);

// NEW: Route to mark a chapter as complete for the logged-in user
router.post('/complete/:tutorialId/:chapterId', verifyToken, markChapterAsComplete);

export default router;