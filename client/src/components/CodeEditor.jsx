import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button, ToggleSwitch } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { FaPlay, FaRedo } from 'react-icons/fa';

// Default code for each language to start with
const defaultCodes = {
    html: `<!DOCTYPE html>\n<html>\n<body>\n\n  <h1>Try It Yourself</h1>\n  <p>Edit the code below and see the output.</p>\n\n</body>\n</html>`,
    css: `body {\n  font-family: sans-serif;\n  background-color: #f0f0f0;\n}\nh1 {\n  color: #333;\n}`,
    javascript: `console.log("This is the JS console output.");`
};

export default function CodeEditor() {
    const { theme } = useSelector((state) => state.theme);

    const [html, setHtml] = useState(defaultCodes.html);
    const [css, setCss] = useState(defaultCodes.css);
    const [js, setJs] = useState(defaultCodes.javascript);
    const [selectedLanguage, setSelectedLanguage] = useState('html');
    const [srcDoc, setSrcDoc] = useState('');
    const [jsConsoleOutput, setJsConsoleOutput] = useState('');
    const [autoRun, setAutoRun] = useState(true);

    const codeMap = {
        html: { code: html, setCode: setHtml },
        css: { code: css, setCode: setCss },
        javascript: { code: js, setCode: setJs },
    };

    const runCode = () => {
        const fullSrcDoc = `
            <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>
                        const originalLog = console.log;
                        let outputBuffer = '';
                        console.log = (...args) => {
                            outputBuffer += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') + '\\n';
                        };
                        
                        try {
                            ${js}
                            window.parent.postMessage({ type: 'js-output', output: outputBuffer.trim() || 'Execution complete.' }, '*');
                        } catch (e) {
                            window.parent.postMessage({ type: 'js-output', output: 'Error: ' + e.message }, '*');
                        } finally {
                            console.log = originalLog;
                        }
                    </script>
                </body>
            </html>
        `;
        setSrcDoc(fullSrcDoc);
    };

    // Effect for auto-run feature
    useEffect(() => {
        if (!autoRun) return;

        const timeout = setTimeout(() => {
            runCode();
        }, 1000); // Debounce time of 1000ms

        return () => clearTimeout(timeout);
    }, [html, css, js, autoRun]);

    // Initial run on component mount
    useEffect(() => {
        runCode();
    }, []);

    // Effect for handling iframe messages
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'js-output') {
                setJsConsoleOutput(event.data.output);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const resetCode = () => {
        setHtml(defaultCodes.html);
        setCss(defaultCodes.css);
        setJs(defaultCodes.javascript);
        setSrcDoc('');
        setJsConsoleOutput('');
    };

    return (
        <div className="flex flex-col h-[90vh] md:h-[800px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl">
            {/* Control Panel */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-2 mb-4 gap-4">
                {/* Language Selector and Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {['html', 'css', 'javascript'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                                selectedLanguage === lang
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-gray-600'
                            }`}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Functionality Buttons */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ToggleSwitch checked={autoRun} onChange={() => setAutoRun(!autoRun)} label="Auto-Run" className="text-sm font-medium" />
                    </div>
                    {!autoRun && (
                        <Button gradientDuoTone="purpleToBlue" onClick={runCode}>
                            <FaPlay className="mr-2 h-4 w-4" /> Run Code
                        </Button>
                    )}
                    <Button outline gradientDuoTone="pinkToOrange" onClick={resetCode}>
                        <FaRedo className="mr-2 h-4 w-4" /> Reset
                    </Button>
                </div>
            </div>

            {/* Main Code Editor & Output Panel */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                {/* Single Code Editor Panel */}
                <div className="flex-1 flex flex-col rounded-md shadow-inner bg-white dark:bg-gray-800 p-2">
                    <div className="flex-1 rounded-md overflow-hidden">
                        <Editor
                            height="100%"
                            language={selectedLanguage}
                            value={codeMap[selectedLanguage].code}
                            theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                            onChange={codeMap[selectedLanguage].setCode}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                folding: true,
                                scrollbar: { vertical: 'auto', horizontal: 'auto' },
                                padding: { top: 10, bottom: 10 },
                            }}
                        />
                    </div>
                </div>

                {/* Live Output & Console Panel */}
                <div className="flex flex-col flex-1 gap-4">
                    <div className="flex-1 flex flex-col rounded-md shadow-inner bg-white dark:bg-gray-800 p-2">
                        <h3 className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Live Output</h3>
                        <div className="flex-1 rounded-md overflow-hidden bg-white dark:bg-gray-800">
                            <iframe
                                title="live-output"
                                srcDoc={srcDoc}
                                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                                className="w-full h-full bg-white dark:bg-gray-800 border-none"
                            />
                        </div>
                    </div>
                    <div className="h-40 flex flex-col rounded-md shadow-inner bg-gray-900 p-2">
                        <h3 className="block text-sm font-semibold mb-1 text-gray-300">Console Output</h3>
                        <div className="flex-1 rounded-md overflow-auto bg-gray-900">
                            <pre className="whitespace-pre-wrap p-2 text-sm text-green-400 font-mono">
                                {jsConsoleOutput || 'Execution complete.'}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}