// api/controllers/python.controller.js
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from '../utils/error.js';

// Get the current directory name and define the temporary directory
const __dirname = path.resolve();
const TEMP_DIR = path.join(__dirname, 'temp');

const execFileAsync = promisify(execFile);

// Function to check for available python executable
const getPythonCommand = async () => {
    try {
        await execFileAsync('python3', ['--version']);
        return 'python3';
    } catch {
        try {
            await execFileAsync('python', ['--version']);
            return 'python';
        } catch {
            return null;
        }
    }
};

export const runPythonCode = async (req, res, next) => {
    const { code } = req.body;
    if (!code) {
        return next(errorHandler(400, 'Python code is required.'));
    }

    await fs.promises.mkdir(TEMP_DIR, { recursive: true });

    const pythonCommand = await getPythonCommand();
    if (!pythonCommand) {
        return next(errorHandler(500, 'Python executable not found on the server.'));
    }

    const uniqueId = uuidv4();
    const filePath = path.join(TEMP_DIR, `${uniqueId}.py`);

    try {
        // 1. Write the code to a temporary Python file
        await fs.promises.writeFile(filePath, code);

        // 2. Execute the Python script using a child process without shell
        const { stdout } = await execFileAsync(pythonCommand, [filePath], {
            timeout: 5000,
        });

        // 3. Send the output back to the client
        res.status(200).json({ output: stdout, error: false });
    } catch (err) {
        const output = err?.stderr || err?.message || String(err);
        res.status(200).json({ output, error: true });
    } finally {
        // 4. Clean up the temporary Python file
        try {
            await fs.promises.unlink(filePath);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
};
