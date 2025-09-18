import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, Select, Textarea, ToggleSwitch, Tooltip, Alert } from 'flowbite-react';
import { FaExternalLinkAlt, FaInfoCircle, FaPlay, FaRedo, FaLightbulb } from 'react-icons/fa';

const defaultSnippets = {
    python: `def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint('5! =', factorial(5))`,
    javascript: `function fibonacci(limit) {\n  const seq = [0, 1];\n  while (seq.length < limit) {\n    const next = seq[seq.length - 1] + seq[seq.length - 2];\n    seq.push(next);\n  }\n  return seq;\n}\n\nconsole.log('First 8 numbers:', fibonacci(8));`,
};

const buildTutorUrl = (language, code, { cumulative, heapPrimitives, textReferences }, mode = 'iframe') => {
    const params = new URLSearchParams({
        code,
        origin: 'scientistshield',
        cumulative: cumulative ? 'true' : 'false',
        heapPrimitives: heapPrimitives ? 'true' : 'false',
        textReferences: textReferences ? 'true' : 'false',
        curInstr: '0',
        codeDivHeight: '450',
        codeDivWidth: '500',
    });

    if (language === 'python') {
        params.set('lang', 'python3');
        params.set('py', '3');
    } else {
        params.set('lang', 'js');
        params.set('js', 'es6');
    }

    params.set('rawInputLstJSON', '[]');

    const base = mode === 'visualize'
        ? 'https://pythontutor.com/visualize.html'
        : 'https://pythontutor.com/iframe-embed.html';

    return `${base}#${params.toString()}`;
};

const visualizerOptions = [
    { key: 'cumulative', label: 'Cumulative mode', helper: 'Keeps variables alive between runs (Python only).' },
    { key: 'heapPrimitives', label: 'Show primitives as references', helper: 'Displays small values on the heap.' },
    { key: 'textReferences', label: 'Text references', helper: 'Uses textual labels for object references.' },
];

export default function CodeVisualizer() {
    const location = useLocation();
    const incomingLanguage = location.state?.language === 'javascript' ? 'javascript' : 'python';
    const [language, setLanguage] = useState(incomingLanguage);
    const [codes, setCodes] = useState({
        python: incomingLanguage === 'python' && location.state?.code ? location.state.code : defaultSnippets.python,
        javascript: incomingLanguage === 'javascript' && location.state?.code ? location.state.code : defaultSnippets.javascript,
    });
    const [cumulative, setCumulative] = useState(false);
    const [heapPrimitives, setHeapPrimitives] = useState(false);
    const [textReferences, setTextReferences] = useState(false);
    const [visualizerUrl, setVisualizerUrl] = useState(() =>
        buildTutorUrl(incomingLanguage, incomingLanguage === 'python' ? (location.state?.code || defaultSnippets.python) : (location.state?.code || defaultSnippets.javascript), {
            cumulative: false,
            heapPrimitives: false,
            textReferences: false,
        })
    );

    useEffect(() => {
        if (location.state?.code) {
            const normalizedLanguage = location.state?.language === 'javascript' ? 'javascript' : 'python';
            setCodes(prev => ({ ...prev, [normalizedLanguage]: location.state.code }));
            setLanguage(normalizedLanguage);
            setCumulative(false);
            setHeapPrimitives(false);
            setTextReferences(false);
            setVisualizerUrl(buildTutorUrl(normalizedLanguage, location.state.code, {
                cumulative: false,
                heapPrimitives: false,
                textReferences: false,
            }));
        }
    }, [location.state?.code, location.state?.language]);

    const supportsCumulative = language === 'python';

    const handleRun = () => {
        setVisualizerUrl(buildTutorUrl(language, codes[language], {
            cumulative,
            heapPrimitives,
            textReferences,
        }));
    };

    const handleReset = () => {
        setCodes(prev => ({
            ...prev,
            [language]: defaultSnippets[language],
        }));
        setCumulative(false);
        setHeapPrimitives(false);
        setTextReferences(false);
        setVisualizerUrl(buildTutorUrl(language, defaultSnippets[language], {
            cumulative: false,
            heapPrimitives: false,
            textReferences: false,
        }));
    };

    const openInNewTab = () => {
        const url = buildTutorUrl(language, codes[language], {
            cumulative,
            heapPrimitives,
            textReferences,
        }, 'visualize');
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const activeCode = codes[language];

    const infoText = useMemo(() => (
        language === 'python'
            ? 'Visualize how each Python line executes, watch stack frames grow, and inspect variables over time.'
            : 'Step through JavaScript execution to see how the call stack and objects change after each instruction.'
    ), [language]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 text-gray-800 dark:text-gray-100">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-extrabold">Code Visualizer</h1>
                    <p className="text-lg max-w-2xl mx-auto">
                        Bring your {language === 'python' ? 'Python' : 'JavaScript'} code to life with an execution trace inspired by Python Tutor.
                        Paste code, tweak the options, and press Visualize to explore each step.
                    </p>
                </div>

                <Alert color="info" icon={FaInfoCircle} className="max-w-3xl mx-auto">
                    <span>
                        {infoText} This view is powered by an embedded Python Tutor experience.
                    </span>
                </Alert>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                    <Card className="space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Language
                            </label>
                            <Select
                                value={language}
                                onChange={(event) => {
                                    const nextLanguage = event.target.value;
                                    setLanguage(nextLanguage);
                                    if (nextLanguage !== 'python') {
                                        setCumulative(false);
                                    }
                                    const nextCode = codes[nextLanguage] ?? defaultSnippets[nextLanguage];
                                    setVisualizerUrl(buildTutorUrl(nextLanguage, nextCode, {
                                        cumulative: nextLanguage === 'python' ? cumulative : false,
                                        heapPrimitives,
                                        textReferences,
                                    }));
                                }}
                            >
                                <option value="python">Python 3</option>
                                <option value="javascript">JavaScript (ES6)</option>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Code
                            </label>
                            <Textarea
                                rows={16}
                                value={activeCode}
                                onChange={(event) => setCodes(prev => ({ ...prev, [language]: event.target.value }))}
                                className="font-mono text-sm"
                                helperText="Use standard input functions (input()/prompt()) and Python Tutor will prompt during visualization."
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Visualization options
                            </h2>
                            <div className="space-y-3">
                                {visualizerOptions.map(({ key, label, helper }) => {
                                    const checked = key === 'cumulative' ? cumulative : key === 'heapPrimitives' ? heapPrimitives : textReferences;
                                    const setChecked = key === 'cumulative' ? setCumulative : key === 'heapPrimitives' ? setHeapPrimitives : setTextReferences;
                                    const disabled = key === 'cumulative' && !supportsCumulative;
                                    const toggle = (
                                        <ToggleSwitch
                                            checked={disabled ? false : checked}
                                            disabled={disabled}
                                            label={label}
                                            className="flex w-full flex-row-reverse items-center justify-between"
                                            aria-label={label}
                                            onChange={() => setChecked(prev => !prev)}
                                        />
                                    );

                                    return (
                                        <div key={key} className="space-y-1">
                                            {disabled ? (
                                                <Tooltip content="Cumulative mode is only available for Python.">{toggle}</Tooltip>
                                            ) : (
                                                toggle
                                            )}
                                            <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">{helper}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button gradientDuoTone="purpleToBlue" onClick={handleRun}>
                                <FaPlay className="mr-2" /> Visualize
                            </Button>
                            <Button color="gray" onClick={openInNewTab}>
                                <FaExternalLinkAlt className="mr-2" /> Open full Python Tutor
                            </Button>
                            <Button color="light" onClick={handleReset}>
                                <FaRedo className="mr-2" /> Reset
                            </Button>
                        </div>

                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 space-y-2 text-sm">
                            <div className="flex items-center gap-2 font-semibold">
                                <FaLightbulb className="text-amber-400" /> Tips
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                                <li>Use comments to mark checkpoints before running so you know where to pause.</li>
                                <li>Switch to cumulative mode to demonstrate how state persists between Python function calls.</li>
                                <li>Open the full Python Tutor view for sharing or to save a permalink of your trace.</li>
                            </ul>
                        </div>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur min-h-[550px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Execution trace</h2>
                            <Button size="xs" color="gray" onClick={handleRun}>
                                <FaPlay className="mr-1" /> Refresh
                            </Button>
                        </div>
                        <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <iframe
                                key={visualizerUrl}
                                title="Python Tutor Visualizer"
                                src={visualizerUrl}
                                className="w-full h-[500px] md:h-full"
                                allowFullScreen
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
