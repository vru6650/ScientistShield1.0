import express from 'express';
import { runPythonCode, visualizePythonCode } from '../controllers/python.controller.js';

const router = express.Router();

router.post('/run-python', runPythonCode);
router.post('/visualize-python', visualizePythonCode);

export default router;