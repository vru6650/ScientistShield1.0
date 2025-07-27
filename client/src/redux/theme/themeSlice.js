import { createSlice } from '@reduxjs/toolkit';

/**
 * Determines the initial theme by checking the following, in order:
 * 1. The value stored in localStorage.
 * 2. The user's OS-level preference ('prefers-color-scheme').
 * 3. A default value of 'light'.
 *
 * This function also applies the determined theme class to the documentElement
 * immediately to prevent a "flash of unstyled content" (FOUC).
 * @returns {'light' | 'dark'} The calculated initial theme.
 */
const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    let initialTheme;

    if (savedTheme) {
        initialTheme = savedTheme;
    } else {
        const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialTheme = userPrefersDark ? 'dark' : 'light';
    }

    // Apply the theme class to the documentElement immediately
    if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    return initialTheme;
};

const initialState = {
    theme: getInitialTheme(), // Call getInitialTheme which also sets the DOM class
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
            // Directly apply the class to the HTML element
            if (state.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        setTheme: (state, action) => {
            const newTheme = action.payload;
            if (newTheme === 'light' || newTheme === 'dark') { // Basic validation
                state.theme = newTheme;
                localStorage.setItem('theme', newTheme);
                // Directly apply the class to the HTML element
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } else {
                console.warn(`Attempted to set invalid theme: ${newTheme}`);
            }
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;