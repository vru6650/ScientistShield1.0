// api/controllers/cpp.controller.js
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid'; // Use uuid to create unique filenames
import { errorHandler } from '../utils/error.js';

// Get the current directory name
const __dirname = path.resolve();
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure the temporary directory exists asynchronously
await fs.promises.mkdir(TEMP_DIR, { recursive: true });

const execAsync = promisify(exec);

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
        await fs.promises.writeFile(filePath, code);

        // 2. Compile the C++ code
        const compileCommand = `g++ "${filePath}" -o "${executablePath}"`;
        await execAsync(compileCommand);

        // 3. Execute the compiled program
        const { stdout } = await execAsync(`"${executablePath}"`);

        // 4. Send the output back to the client
        res.status(200).json({ output: stdout, error: false });
    } catch (err) {
        const output = err?.stderr || err?.message || String(err);
        res.status(200).json({ output, error: true });
    } finally {
        // 5. Clean up temporary files
        try {
            await fs.promises.unlink(filePath);
        } catch (e) {
            // Ignore cleanup errors
        }
        try {
            await fs.promises.unlink(executablePath);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
};
