import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Use uuid to create unique filenames
import { errorHandler } from '../utils/error.js';

// Get the current directory name
const __dirname = path.resolve();
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure the temporary directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

export const runCppCode = async (req, res, next) => {
    const { code } = req.body;
    if (!code) {
        return next(errorHandler(400, 'C++ code is required.'));
    }

    const uniqueId = uuidv4();
    const filePath = path.join(TEMP_DIR, `${uniqueId}.cpp`);
    const executablePath = path.join(TEMP_DIR, `${uniqueId}.out`);

    try {
        // 1. Write the code to a temporary file
        fs.writeFileSync(filePath, code);

        // 2. Compile the C++ code
        const compileCommand = `g++ "${filePath}" -o "${executablePath}"`;
        await new Promise((resolve, reject) => {
            exec(compileCommand, (error, stdout, stderr) => {
                if (error) {
                    return reject(stderr);
                }
                resolve();
            });
        });

        // 3. Execute the compiled program
        const executeCommand = `"${executablePath}"`;
        exec(executeCommand, (error, stdout, stderr) => {
            // 4. Send the output back to the client
            if (error) {
                res.status(200).json({ output: stderr, error: true });
            } else {
                res.status(200).json({ output: stdout, error: false });
            }

            // 5. Clean up temporary files
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting source file:', err);
            });
            fs.unlink(executablePath, (err) => {
                if (err) console.error('Error deleting executable file:', err);
            });
        });
    } catch (err) {
        res.status(200).json({ output: err, error: true });

        // Ensure cleanup even on compilation failure
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting source file:', err);
        });
    }
};