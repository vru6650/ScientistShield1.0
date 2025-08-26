import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from '../utils/error.js';

// Get the current directory name and define the temporary directory
const __dirname = path.resolve();
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure the temporary directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// Function to check for available python executable
const getPythonCommand = async () => {
    return new Promise((resolve) => {
        exec('python3 --version', (error) => {
            if (!error) {
                return resolve('python3');
            }
            exec('python --version', (error) => {
                if (!error) {
                    return resolve('python');
                }
                resolve(null);
            });
        });
    });
};

export const runPythonCode = async (req, res, next) => {
    const { code } = req.body;
    if (!code) {
        return next(errorHandler(400, 'Python code is required.'));
    }

    const pythonCommand = await getPythonCommand();
    if (!pythonCommand) {
        return next(errorHandler(500, 'Python executable not found on the server.'));
    }

    const uniqueId = uuidv4();
    const filePath = path.join(TEMP_DIR, `${uniqueId}.py`);

    try {
        // 1. Write the code to a temporary Python file
        fs.writeFileSync(filePath, code);

        // 2. Execute the Python script using a child process
        const executeCommand = `${pythonCommand} "${filePath}"`;
        exec(executeCommand, { timeout: 5000 }, (error, stdout, stderr) => {
            // 3. Send the output back to the client
            if (error) {
                // If there's an error, it will be in stderr
                res.status(200).json({ output: stderr || error.message, error: true });
            } else {
                // Otherwise, send the standard output
                res.status(200).json({ output: stdout, error: false });
            }

            // 4. Clean up the temporary Python file
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting Python file:', err);
            });
        });

    } catch (err) {
        // Handle file system errors or other exceptions
        res.status(500).json({ output: err.message, error: true });
    }
};