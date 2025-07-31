import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
    createTutorial,
    getTutorials,
    getSingleTutorial,
    updateTutorial,
    deleteTutorial,
    addChapter,
    updateChapter,
    deleteChapter
} from '../controllers/tutorial.controller.js';

const router = express.Router();

// Tutorial CRUD operations (admin-only)
router.post('/create', verifyToken, createTutorial);
router.get('/gettutorials', getTutorials); // Publicly accessible to fetch all or filtered tutorials
router.get('/getsingletutorial/:tutorialSlug', getSingleTutorial); // Publicly accessible for a single tutorial
router.put('/update/:tutorialId/:userId', verifyToken, updateTutorial);
router.delete('/delete/:tutorialId/:userId', verifyToken, deleteTutorial);

// Chapter operations (admin-only)
router.post('/addchapter/:tutorialId/:userId', verifyToken, addChapter);
router.put('/updatechapter/:tutorialId/:chapterId/:userId', verifyToken, updateChapter);
router.delete('/deletechapter/:tutorialId/:chapterId/:userId', verifyToken, deleteChapter);

export default router;