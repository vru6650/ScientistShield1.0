import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Alert,
    Badge,
    Button,
    Card,
    Spinner,
    Textarea,
    ToggleSwitch,
    Tooltip,
} from 'flowbite-react';
import {
    FaBug,
    FaChartBar,
    FaCode,
    FaExchangeAlt,
    FaInfoCircle,
    FaMinusCircle,
    FaPause,
    FaPlay,
    FaPlusCircle,
    FaRedo,
    FaStepBackward,
    FaStepForward,
    FaTerminal,
} from 'react-icons/fa';

const defaultPythonSnippet = `def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint('5! =', factorial(5))`;

const eventMetadata = {
    call: { label: 'Call', color: 'purple' },
    line: { label: 'Line', color: 'info' },
    return: { label: 'Return', color: 'success' },
    exception: { label: 'Exception', color: 'failure' },
};

const descriptiveLabels = {
    call: 'A function frame was pushed onto the stack.',
    line: 'A line of code executed inside the current frame.',
    return: 'Execution is returning from the current frame.',
    exception: 'An exception was raised at this position.',
};

const formatStepLabel = (event) => {
    const meta = eventMetadata[event.event] ?? { label: 'Event' };
    return meta.label;
};

export default function CodeVisualizer() {
    const location = useLocation();
    const incomingPythonCode =
        location.state?.language === 'python' && typeof location.state?.code === 'string'
            ? location.state.code
            : null;

    const [code, setCode] = useState(incomingPythonCode || defaultPythonSnippet);
    const [trace, setTrace] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playDelay, setPlayDelay] = useState(900);
    const [autoPlay, setAutoPlay] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const events = trace?.events ?? [];
    const hasEvents = events.length > 0;
    const currentEvent = hasEvents ? events[Math.min(currentIndex, events.length - 1)] : null;
    const previousEvent = hasEvents && currentIndex > 0 ? events[currentIndex - 1] : null;
    const codeLines = useMemo(() => code.replace(/\r\n/g, '\n').split('\n'), [code]);
    const currentLine = currentEvent?.line ?? null;
    const timelineProgress = hasEvents ? Math.round((currentIndex / Math.max(events.length - 1, 1)) * 100) : 0;

    const insights = useMemo(() => {
        const counts = { call: 0, line: 0, return: 0, exception: 0 };
        const functions = new Set();
        let maxStackDepth = 0;

        events.forEach((event) => {
            if (typeof counts[event.event] === 'number') {
                counts[event.event] += 1;
            }
            if (event?.function) {
                functions.add(event.function);
            }
            const depth = Array.isArray(event?.stack) ? event.stack.length : 0;
            if (depth > maxStackDepth) {
                maxStackDepth = depth;
            }
        });

        return {
            totalEvents: events.length,
            counts,
            uniqueFunctionCount: functions.size,
            maxStackDepth,
        };
    }, [events]);

    const variableDiff = useMemo(() => {
        if (!currentEvent) {
            return { added: [], updated: [], removed: [] };
        }

        const previousLocals = previousEvent?.locals ?? {};
        const currentLocals = currentEvent.locals ?? {};

        const added = [];
        const updated = [];
        const removed = [];

        Object.entries(currentLocals).forEach(([key, value]) => {
            if (!(key in previousLocals)) {
                added.push({ key, value });
            } else if (previousLocals[key] !== value) {
                updated.push({ key, previous: previousLocals[key], current: value });
            }
        });

        Object.entries(previousLocals).forEach(([key, value]) => {
            if (!(key in currentLocals)) {
                removed.push({ key, previous: value });
            }
        });

        return { added, updated, removed };
    }, [currentEvent, previousEvent]);

    useEffect(() => {
        if (!isPlaying) return undefined;
        if (!hasEvents) return undefined;
        if (currentIndex >= events.length - 1) {
            setIsPlaying(false);
            return undefined;
        }

        const timer = setTimeout(() => {
            setCurrentIndex((previous) => Math.min(previous + 1, events.length - 1));
        }, playDelay);

        return () => clearTimeout(timer);
    }, [isPlaying, playDelay, currentIndex, events.length, hasEvents]);

    useEffect(() => {
        if (incomingPythonCode) {
            setCode(incomingPythonCode);
        }
    }, [incomingPythonCode]);

    const handleVisualize = async () => {
        setIsLoading(true);
        setIsPlaying(false);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/code/visualize-python', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const payload = await response.json();

            if (!response.ok) {
                setTrace(null);
                setErrorMessage(payload?.message || 'Unable to visualize the code.');
                return;
            }

            setTrace(payload);
            setCurrentIndex(0);
            if (payload?.error?.message) {
                setErrorMessage(payload.error.message);
            } else if (!payload.success) {
                setErrorMessage('Visualization completed with errors. Inspect the trace for details.');
            } else {
                setErrorMessage(null);
            }

            if (autoPlay && Array.isArray(payload?.events) && payload.events.length > 0) {
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Failed to visualize python code:', error);
            setTrace(null);
            setErrorMessage('An unexpected error occurred while visualizing your code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetCode = () => {
        setCode(defaultPythonSnippet);
        setTrace(null);
        setCurrentIndex(0);
        setIsPlaying(false);
        setErrorMessage(null);
    };

    const goToStep = (index) => {
        if (!hasEvents) return;
        setCurrentIndex(Math.max(0, Math.min(index, events.length - 1)));
        setIsPlaying(false);
    };

    const handleStepForward = () => {
        if (!hasEvents) return;
        goToStep(Math.min(currentIndex + 1, events.length - 1));
    };

    const handleStepBackward = () => {
        if (!hasEvents) return;
        goToStep(Math.max(currentIndex - 1, 0));
    };

    const togglePlayback = () => {
        if (!hasEvents) return;
        setIsPlaying((prev) => !prev);
    };

    const stdoutForCurrentStep = currentEvent?.stdout ?? trace?.stdout ?? '';
    const stderrOutput = trace?.stderr ?? '';
    const activeEventMeta = currentEvent ? eventMetadata[currentEvent.event] : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 text-gray-900 dark:text-gray-100">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-3 text-center">
                    <h1 className="text-4xl lg:text-5xl font-extrabold">Python Execution Visualizer</h1>
                    <p className="text-lg max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
                        Step through your Python code line by line. Watch the call stack evolve, inspect variable state, and
                        capture console output without leaving ScientistShield.
                    </p>
                </div>

                <Alert color="info" icon={FaInfoCircle} className="max-w-3xl mx-auto">
                    Paste Python 3 code, press <strong>Visualize</strong>, and then walk through the execution timeline using
                    the playback controls. Each step includes the active line, variable snapshots, and the call stack.
                </Alert>

                <Card className="space-y-6 bg-white/90 dark:bg-gray-800/80 backdrop-blur">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Python code
                                </label>
                                <Textarea
                                    rows={16}
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    className="font-mono text-sm"
                                    helperText="The visualizer captures standard output, return values, and exceptions."
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button gradientDuoTone="purpleToBlue" onClick={handleVisualize} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" />
                                            Visualizing...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlay className="mr-2" /> Visualize
                                        </>
                                    )}
                                </Button>
                                <Button color="light" onClick={handleResetCode} disabled={isLoading}>
                                    <FaRedo className="mr-2" /> Reset to example
                                </Button>
                                <ToggleSwitch
                                    checked={autoPlay}
                                    label="Auto-play after run"
                                    onChange={() => setAutoPlay((prev) => !prev)}
                                />
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Step delay:</span>
                                    <Tooltip content={`${(playDelay / 1000).toFixed(1)}s per step`}>
                                        <input
                                            type="range"
                                            min={300}
                                            max={2000}
                                            step={100}
                                            value={playDelay}
                                            onChange={(event) => setPlayDelay(Number(event.target.value))}
                                            className="w-36 accent-purple-500"
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-80 space-y-4">
                            <Card className="bg-purple-500/10 border border-purple-200 dark:border-purple-700">
                                <div className="flex items-center gap-3">
                                    <FaCode className="text-purple-500" />
                                    <div>
                                        <h2 className="text-sm font-semibold">How it works</h2>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            We execute your Python code in an isolated worker with tracing enabled, capturing every
                                            call, line, return, and exception. Nothing is stored on the server.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-amber-500/10 border border-amber-200 dark:border-amber-700">
                                <div className="flex items-start gap-3">
                                    <FaBug className="text-amber-500 mt-1" />
                                    <div>
                                        <h2 className="text-sm font-semibold">Tips</h2>
                                        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                            <li>Add print statements to compare console output with variable snapshots.</li>
                                            <li>Recursive functions shine when you track the stack growth step-by-step.</li>
                                            <li>Use the slider to slow down tricky sections of code.</li>
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </Card>

                {errorMessage && (
                    <Alert color="failure" icon={FaBug} className="max-w-4xl mx-auto">
                        {errorMessage}
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <Card className="space-y-5 bg-white/90 dark:bg-gray-800/80 backdrop-blur">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <FaCode /> Trace timeline
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {hasEvents
                                        ? `Step ${currentIndex + 1} of ${events.length} (${timelineProgress}% complete)`
                                        : 'Run the visualizer to generate an execution trace.'}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button color="light" onClick={handleStepBackward} disabled={!hasEvents}>
                                    <FaStepBackward className="mr-1" /> Prev
                                </Button>
                                <Button color="light" onClick={togglePlayback} disabled={!hasEvents}>
                                    {isPlaying ? (
                                        <>
                                            <FaPause className="mr-1" /> Pause
                                        </>
                                    ) : (
                                        <>
                                            <FaPlay className="mr-1" /> Play
                                        </>
                                    )}
                                </Button>
                                <Button color="light" onClick={handleStepForward} disabled={!hasEvents}>
                                    <FaStepForward className="mr-1" /> Next
                                </Button>
                                <Button color="light" onClick={() => goToStep(0)} disabled={!hasEvents}>
                                    <FaRedo className="mr-1" /> Restart
                                </Button>
                            </div>
                        </div>

                        {hasEvents && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        <FaChartBar />
                                        <span>Execution insights</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white/70 dark:bg-gray-900/40">
                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total steps</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{insights.totalEvents}</p>
                                        </div>
                                        <div className="rounded-lg border border-purple-200 dark:border-purple-700 p-3 bg-purple-500/10">
                                            <p className="text-xs uppercase tracking-wide text-purple-500">Call events</p>
                                            <p className="text-lg font-semibold text-purple-600 dark:text-purple-300">{insights.counts.call}</p>
                                        </div>
                                        <div className="rounded-lg border border-blue-200 dark:border-blue-700 p-3 bg-blue-500/10">
                                            <p className="text-xs uppercase tracking-wide text-blue-500">Line events</p>
                                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-300">{insights.counts.line}</p>
                                        </div>
                                        <div className="rounded-lg border border-emerald-200 dark:border-emerald-700 p-3 bg-emerald-500/10">
                                            <p className="text-xs uppercase tracking-wide text-emerald-500">Returns</p>
                                            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">{insights.counts.return}</p>
                                        </div>
                                        <div className="rounded-lg border border-rose-200 dark:border-rose-700 p-3 bg-rose-500/10">
                                            <p className="text-xs uppercase tracking-wide text-rose-500">Exceptions</p>
                                            <p className="text-lg font-semibold text-rose-600 dark:text-rose-300">{insights.counts.exception}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white/70 dark:bg-gray-900/40">
                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Unique functions</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{insights.uniqueFunctionCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Scrub the timeline</label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={Math.max(events.length - 1, 0)}
                                        value={currentIndex}
                                        onChange={(event) => goToStep(Number(event.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>Start</span>
                                        <span>
                                            Step {currentIndex + 1} · {formatStepLabel(currentEvent)} · line {currentEvent?.line ?? '—'}
                                        </span>
                                        <span>End</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"
                                            style={{ width: `${timelineProgress}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                        Max stack depth observed: <span className="font-semibold text-indigo-500 dark:text-indigo-300">{insights.maxStackDepth}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <pre className="bg-gray-900 text-gray-100 text-sm font-mono p-4 overflow-auto max-h-[420px]">
                                {codeLines.map((line, index) => {
                                    const isActive = currentLine === index + 1;
                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-4 py-1 px-2 rounded ${
                                                isActive ? 'bg-purple-500/30 text-white' : 'text-gray-300'
                                            }`}
                                        >
                                            <span className="w-10 text-right text-xs text-gray-500 dark:text-gray-500">
                                                {index + 1}
                                            </span>
                                            <span className="flex-1 whitespace-pre">{line || ' '}</span>
                                        </div>
                                    );
                                })}
                            </pre>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Timeline
                            </h3>
                            {hasEvents ? (
                                <div className="flex overflow-x-auto gap-3 pb-1">
                                    {events.map((event, index) => {
                                        const isActive = index === currentIndex;
                                        const meta = eventMetadata[event.event] ?? { color: 'gray', label: 'Event' };
                                        return (
                                            <Tooltip
                                                key={`event-${index}`}
                                                content={`${formatStepLabel(event)} — ${descriptiveLabels[event.event] || ''}`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => goToStep(index)}
                                                    className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                                                        isActive
                                                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-400'
                                                    }`}
                                                >
                                                    <span className="text-[0.7rem] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                                        #{index + 1}
                                                    </span>
                                                    <span>{meta.label}</span>
                                                </button>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Once a trace is generated, each event will appear here for quick navigation.
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card className="space-y-5 bg-white/90 dark:bg-gray-800/80 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FaTerminal /> State inspector
                            </h2>
                            {activeEventMeta && (
                                <Badge color={activeEventMeta.color} className="uppercase">
                                    {activeEventMeta.label}
                                </Badge>
                            )}
                        </div>

                        {currentEvent ? (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Event details</h3>
                                    <dl className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex justify-between">
                                            <dt>Function</dt>
                                            <dd className="font-mono">{currentEvent.function}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt>Line</dt>
                                            <dd className="font-mono">{currentEvent.line}</dd>
                                        </div>
                                        {currentEvent.event === 'return' && currentEvent.returnValue && (
                                            <div className="flex justify-between">
                                                <dt>Return value</dt>
                                                <dd className="font-mono">{currentEvent.returnValue}</dd>
                                            </div>
                                        )}
                                        {currentEvent.event === 'exception' && currentEvent.exception && (
                                            <div className="text-red-500 dark:text-red-400">
                                                <p className="font-semibold">{currentEvent.exception.type}</p>
                                                <p className="font-mono text-xs">{currentEvent.exception.message}</p>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {descriptiveLabels[currentEvent.event]}
                                        </div>
                                    </dl>
                                </div>

                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Variable changes</h3>
                                    {previousEvent ? (
                                        variableDiff.added.length === 0 &&
                                        variableDiff.updated.length === 0 &&
                                        variableDiff.removed.length === 0 ? (
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No variable changes since the previous step.</p>
                                        ) : (
                                            <div className="mt-3 space-y-3 text-sm font-mono text-gray-700 dark:text-gray-200">
                                                {variableDiff.added.length > 0 && (
                                                    <div>
                                                        <p className="flex items-center gap-2 text-green-500">
                                                            <FaPlusCircle /> Added
                                                        </p>
                                                        <ul className="mt-1 space-y-1">
                                                            {variableDiff.added.map(({ key, value }) => (
                                                                <li key={`added-${key}`} className="flex justify-between gap-3">
                                                                    <span>{key}</span>
                                                                    <span className="text-right break-all">{value}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {variableDiff.updated.length > 0 && (
                                                    <div>
                                                        <p className="flex items-center gap-2 text-amber-500">
                                                            <FaExchangeAlt /> Updated
                                                        </p>
                                                        <ul className="mt-1 space-y-1">
                                                            {variableDiff.updated.map(({ key, previous, current }) => (
                                                                <li key={`updated-${key}`} className="flex flex-col gap-1">
                                                                    <div className="flex justify-between gap-3">
                                                                        <span>{key}</span>
                                                                        <span className="text-right break-all">{current}</span>
                                                                    </div>
                                                                    <div className="flex justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                                        <span>Previous</span>
                                                                        <span className="text-right break-all">{previous}</span>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {variableDiff.removed.length > 0 && (
                                                    <div>
                                                        <p className="flex items-center gap-2 text-rose-500">
                                                            <FaMinusCircle /> Removed
                                                        </p>
                                                        <ul className="mt-1 space-y-1">
                                                            {variableDiff.removed.map(({ key, previous }) => (
                                                                <li key={`removed-${key}`} className="flex justify-between gap-3">
                                                                    <span>{key}</span>
                                                                    <span className="text-right break-all">{previous}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Initial step — variable history will appear after the next event.
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Local variables</h3>
                                    {currentEvent.locals && Object.keys(currentEvent.locals).length > 0 ? (
                                        <ul className="mt-2 space-y-1 text-sm font-mono text-gray-700 dark:text-gray-200">
                                            {Object.entries(currentEvent.locals).map(([key, value]) => (
                                                <li key={key} className="flex justify-between gap-3">
                                                    <span className="text-purple-500">{key}</span>
                                                    <span className="text-right break-all">{value}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No locals captured for this step.</p>
                                    )}
                                </div>

                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Call stack</h3>
                                    {currentEvent.stack && currentEvent.stack.length > 0 ? (
                                        <ol className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                                            {currentEvent.stack.map((frame, index) => (
                                                <li key={`${frame.function}-${index}`} className="flex justify-between">
                                                    <span>{frame.function}</span>
                                                    <span className="font-mono text-xs text-gray-500">line {frame.line}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Stack is empty at this step.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Generate a trace to inspect execution state. Variable snapshots, return values, and exceptions
                                will appear here as you step through the timeline.
                            </div>
                        )}

                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <FaTerminal /> Console output
                            </div>
                            <pre className="bg-gray-900 text-green-300 text-sm font-mono p-3 rounded-lg min-h-[100px] overflow-auto">
                                {stdoutForCurrentStep ? stdoutForCurrentStep : 'No output captured yet.'}
                            </pre>
                            {stderrOutput && (
                                <Alert color="warning" className="bg-amber-500/10 border border-amber-200 dark:border-amber-600">
                                    <span className="font-semibold">stderr</span>
                                    <pre className="mt-1 text-xs font-mono whitespace-pre-wrap text-amber-600 dark:text-amber-300">
                                        {stderrOutput}
                                    </pre>
                                </Alert>
                            )}
                            {trace?.error?.traceback && (
                                <Alert color="failure" className="bg-red-500/10 border border-red-300 dark:border-red-600">
                                    <span className="font-semibold">Python traceback</span>
                                    <pre className="mt-2 text-xs font-mono whitespace-pre-wrap text-red-500 dark:text-red-300">
                                        {trace.error.traceback}
                                    </pre>
                                </Alert>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
