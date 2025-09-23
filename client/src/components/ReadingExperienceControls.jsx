import { useMemo } from 'react';
import { HiOutlineAdjustmentsHorizontal, HiOutlineEye, HiOutlineSparkles } from 'react-icons/hi2';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { FaMinus, FaPlus } from 'react-icons/fa';

export const DEFAULT_READING_SETTINGS = {
    theme: 'classic',
    fontSize: 18,
    lineHeight: 1.65,
    fontFamily: 'serif',
    columnWidth: 'comfortable',
    focusMode: false,
};

export const THEME_OPTIONS = [
    {
        id: 'classic',
        label: 'Daylight',
        background: '#fdfdf6',
        textColor: '#1f2937',
        borderColor: 'rgba(15, 23, 42, 0.12)',
        linkColor: '#1d4ed8',
        codeBackground: '#e2e8f0',
        codeColor: '#0f172a',
        tocBackground: 'rgba(253, 253, 246, 0.92)',
        tocBorder: 'rgba(148, 163, 184, 0.35)',
        mutedText: 'rgba(51, 65, 85, 0.8)',
        inlineCodeBackground: 'rgba(148, 163, 184, 0.25)',
        inlineCodeColor: '#1f2937',
        quoteBackground: 'rgba(226, 232, 240, 0.55)',
        quoteBorder: 'rgba(29, 78, 216, 0.45)',
        copyButtonBackground: 'rgba(226, 232, 240, 0.9)',
        copyButtonHover: 'rgba(96, 165, 250, 0.6)',
        copyButtonText: '#1f2937',
        icon: HiOutlineSun,
    },
    {
        id: 'sepia',
        label: 'Sepia',
        background: '#f4ecd8',
        textColor: '#3f2f1e',
        borderColor: 'rgba(120, 76, 20, 0.18)',
        linkColor: '#b45309',
        codeBackground: '#ede3cc',
        codeColor: '#3f2f1e',
        tocBackground: 'rgba(244, 236, 216, 0.9)',
        tocBorder: 'rgba(120, 76, 20, 0.25)',
        mutedText: 'rgba(74, 54, 33, 0.8)',
        inlineCodeBackground: 'rgba(217, 188, 140, 0.35)',
        inlineCodeColor: '#3f2f1e',
        quoteBackground: 'rgba(243, 229, 199, 0.9)',
        quoteBorder: 'rgba(180, 83, 9, 0.45)',
        copyButtonBackground: 'rgba(243, 229, 199, 0.9)',
        copyButtonHover: 'rgba(217, 119, 6, 0.4)',
        copyButtonText: '#3f2f1e',
        icon: HiOutlineSparkles,
    },
    {
        id: 'midnight',
        label: 'Midnight',
        background: '#0f172a',
        textColor: '#e2e8f0',
        borderColor: 'rgba(148, 163, 184, 0.25)',
        linkColor: '#38bdf8',
        codeBackground: '#1e293b',
        codeColor: '#e2e8f0',
        tocBackground: 'rgba(15, 23, 42, 0.7)',
        tocBorder: 'rgba(148, 163, 184, 0.35)',
        mutedText: 'rgba(203, 213, 225, 0.7)',
        inlineCodeBackground: 'rgba(56, 189, 248, 0.2)',
        inlineCodeColor: '#e0f2fe',
        quoteBackground: 'rgba(30, 41, 59, 0.85)',
        quoteBorder: 'rgba(56, 189, 248, 0.45)',
        copyButtonBackground: 'rgba(30, 41, 59, 0.9)',
        copyButtonHover: 'rgba(56, 189, 248, 0.35)',
        copyButtonText: '#e2e8f0',
        icon: HiOutlineMoon,
    },
];

export const FONT_FAMILIES = {
    serif: "'Merriweather', 'Georgia', 'Times New Roman', serif",
    sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    mono: "'Fira Code', 'JetBrains Mono', 'SFMono-Regular', monospace",
};

export const COLUMN_WIDTH_OPTIONS = [
    { id: 'narrow', label: 'Compact', description: 'Best for small screens', width: 620 },
    { id: 'comfortable', label: 'Comfort', description: 'Balanced column width', width: 720 },
    { id: 'wide', label: 'Wide', description: 'More words per line', width: 840 },
];

export const COLUMN_WIDTHS = COLUMN_WIDTH_OPTIONS.reduce((acc, option) => {
    acc[option.id] = option.width;
    return acc;
}, {});

const LINE_HEIGHT_OPTIONS = [
    { value: 1.45, label: 'Compact' },
    { value: 1.65, label: 'Relaxed' },
    { value: 1.85, label: 'Airy' },
];

const FONT_OPTIONS = [
    { id: 'serif', label: 'Serif' },
    { id: 'sans', label: 'Sans-serif' },
    { id: 'mono', label: 'Mono' },
];

const MIN_FONT_SIZE = 15;
const MAX_FONT_SIZE = 26;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const ReadingExperienceControls = ({ settings, onSettingChange, onReset, maxWidth }) => {
    const activeTheme = useMemo(
        () => THEME_OPTIONS.find((theme) => theme.id === settings.theme) || THEME_OPTIONS[0],
        [settings.theme],
    );

    const handleThemeChange = (themeId) => {
        onSettingChange('theme', themeId);
    };

    const handleFontSizeStep = (delta) => {
        const nextSize = clamp(settings.fontSize + delta, MIN_FONT_SIZE, MAX_FONT_SIZE);
        onSettingChange('fontSize', nextSize);
    };

    const handleFontSlider = (event) => {
        const value = Number(event.target.value);
        onSettingChange('fontSize', clamp(value, MIN_FONT_SIZE, MAX_FONT_SIZE));
    };

    const handleLineHeightChange = (value) => {
        onSettingChange('lineHeight', value);
    };

    const handleFontFamilyChange = (family) => {
        onSettingChange('fontFamily', family);
    };

    const handleColumnWidthChange = (columnWidth) => {
        onSettingChange('columnWidth', columnWidth);
    };

    const toggleFocusMode = () => {
        onSettingChange('focusMode', !settings.focusMode);
    };

    return (
        <section className='w-full max-w-3xl mx-auto mt-8' style={maxWidth ? { maxWidth } : undefined}>
            <div className='rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 p-5 space-y-6 transition-colors duration-300'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex items-center gap-2 text-slate-700 dark:text-slate-200 uppercase text-xs tracking-[0.25em] font-semibold'>
                        <HiOutlineAdjustmentsHorizontal className='text-lg' />
                        Reading experience
                    </div>
                    <button
                        type='button'
                        onClick={onReset}
                        className='text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200'
                    >
                        Reset to default
                    </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='space-y-3'>
                        <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2'>
                            Theme
                        </h3>
                        <div className='flex flex-wrap gap-2'>
                            {THEME_OPTIONS.map((theme) => {
                                const Icon = theme.icon;
                                const isActive = settings.theme === theme.id;
                                return (
                                    <button
                                        key={theme.id}
                                        type='button'
                                        onClick={() => handleThemeChange(theme.id)}
                                        className={`group relative flex-1 min-w-[120px] rounded-xl border px-3 py-3 transition-all duration-200 ${
                                            isActive
                                                ? 'border-blue-500/70 ring-2 ring-blue-500/50'
                                                : 'border-slate-200/70 dark:border-slate-700/70 hover:border-blue-400/60'
                                        }`}
                                        style={{
                                            background: theme.background,
                                            color: theme.textColor,
                                        }}
                                    >
                                        <span className='flex items-center gap-2 text-sm font-semibold'>
                                            <Icon className='text-base' />
                                            {theme.label}
                                        </span>
                                        <span className='mt-2 block h-2 w-full rounded-full opacity-60 bg-slate-900/10' />
                                        {isActive && (
                                            <span className='absolute -top-2 -right-2 h-3 w-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/40' />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Font size</h3>
                        <div className='flex items-center gap-3'>
                            <button
                                type='button'
                                onClick={() => handleFontSizeStep(-1)}
                                className='flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500/60 hover:text-blue-500 transition-colors disabled:opacity-50'
                                disabled={settings.fontSize <= MIN_FONT_SIZE}
                            >
                                <FaMinus />
                            </button>
                            <div className='text-sm font-semibold text-slate-700 dark:text-slate-200 w-16 text-center'>
                                {settings.fontSize}px
                            </div>
                            <button
                                type='button'
                                onClick={() => handleFontSizeStep(1)}
                                className='flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500/60 hover:text-blue-500 transition-colors disabled:opacity-50'
                                disabled={settings.fontSize >= MAX_FONT_SIZE}
                            >
                                <FaPlus />
                            </button>
                        </div>
                        <input
                            type='range'
                            min={MIN_FONT_SIZE}
                            max={MAX_FONT_SIZE}
                            value={settings.fontSize}
                            onChange={handleFontSlider}
                            className='w-full accent-blue-500'
                        />
                    </div>

                    <div className='space-y-3'>
                        <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Line height</h3>
                        <div className='flex flex-wrap gap-2'>
                            {LINE_HEIGHT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type='button'
                                    onClick={() => handleLineHeightChange(option.value)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                                        settings.lineHeight === option.value
                                            ? 'border-blue-500/70 bg-blue-500/10 text-blue-600 dark:text-blue-300'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400/60'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Typeface</h3>
                        <div className='flex flex-wrap gap-2'>
                            {FONT_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    type='button'
                                    onClick={() => handleFontFamilyChange(option.id)}
                                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                                        settings.fontFamily === option.id
                                            ? 'border-blue-500/70 bg-blue-500/10 text-blue-600 dark:text-blue-300'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400/60'
                                    }`}
                                    style={{ fontFamily: FONT_FAMILIES[option.id] }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Page width</h3>
                        <div className='space-y-2'>
                            {COLUMN_WIDTH_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    type='button'
                                    onClick={() => handleColumnWidthChange(option.id)}
                                    className={`w-full rounded-xl border px-3 py-2 text-left transition-colors duration-200 ${
                                        settings.columnWidth === option.id
                                            ? 'border-blue-500/70 bg-blue-500/10 text-blue-600 dark:text-blue-300'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400/60'
                                    }`}
                                >
                                    <span className='block text-sm font-semibold'>{option.label}</span>
                                    <span className='block text-[0.7rem] text-slate-500 dark:text-slate-400'>
                                        {option.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Focus mode</h3>
                        <button
                            type='button'
                            onClick={toggleFocusMode}
                            className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors duration-200 flex items-center justify-between ${
                                settings.focusMode
                                    ? 'border-blue-500/70 bg-blue-500/10 text-blue-600 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400/60'
                            }`}
                        >
                            <span className='flex items-center gap-2'>
                                <HiOutlineEye className='text-lg' />
                                {settings.focusMode ? 'Disable focus mode' : 'Enable focus mode'}
                            </span>
                            <span className='text-[0.65rem] uppercase tracking-[0.3em]'>
                                {settings.focusMode ? 'On' : 'Off'}
                            </span>
                        </button>
                        <p className='text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                            Focus mode hides supporting panels to deliver an immersive, Kindle-style reading experience.
                        </p>
                    </div>
                </div>

                <div className='rounded-xl border border-dashed border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-slate-100/60 via-transparent to-slate-200/30 dark:from-slate-900/40 dark:via-transparent dark:to-slate-900/40 p-4 text-xs text-slate-500 dark:text-slate-400'>
                    <p>
                        Tip: Your reading preferences are stored locally in this browser, so every article opens with the same
                        Kindle-inspired settings you last used.
                    </p>
                    <p className='mt-2'>Current palette: <span className='font-semibold'>{activeTheme.label}</span></p>
                </div>
            </div>
        </section>
    );
};

export default ReadingExperienceControls;
