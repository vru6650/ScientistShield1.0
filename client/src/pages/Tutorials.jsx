import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spinner, Alert, Button, TextInput, Select } from 'flowbite-react';

// --- ACTION REQUIRED ---
// 1. Create a new file: `src/components/TutorialCard.jsx`
// 2. Paste the 'TutorialCard' component code (provided below) into that new file.
// 3. Then, uncomment/add the following import:
import TutorialCard from '../components/TutorialCard'; // <-- Make sure this line is present!
// -----------------------

import { getTutorials } from '../services/tutorialService.js';

export default function Tutorials() {
    const location = useLocation();
    const navigate = useNavigate();

    // `sidebarSearchTerm` holds the value of the text input field for live typing.
    const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
    // `searchTerm` is the actual query parameter used by `useQuery` to fetch data.
    // It's updated when the form is submitted or URL changes.
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('uncategorized');
    const [sort, setSort] = useState('desc');

    // ---
    // Synchronize component state with URL parameters
    // This `useEffect` runs on component mount and whenever the URL's search parameters change.
    // It ensures that direct URL access (e.g., sharing a filtered link) or browser
    // back/forward navigation correctly populates the filter states.
    // ---
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm') || '';
        const categoryFromUrl = urlParams.get('category') || 'uncategorized';
        const sortFromUrl = urlParams.get('sort') || 'desc';

        setSidebarSearchTerm(searchTermFromUrl); // Keep the search input field in sync with the URL
        setSearchTerm(searchTermFromUrl);        // Update the query term for `useQuery`
        setCategory(categoryFromUrl);
        setSort(sortFromUrl);
    }, [location.search]); // Re-run this effect whenever `location.search` (the URL query string) changes

    // ---
    // Data fetching with `@tanstack/react-query`
    // The `queryKey` array ensures that the data is automatically refetched
    // whenever `searchTerm`, `category`, or `sort` states change.
    // `keepPreviousData: true` provides a smoother user experience by displaying
    // the old data while the new data is being fetched.
    // ---
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['tutorials', { searchTerm, category, sort }], // Unique key for caching based on filters
        queryFn: () => getTutorials(`searchTerm=${searchTerm}&category=${category}&sort=${sort}`),
        staleTime: 1000 * 60 * 5, // Data is considered "fresh" for 5 minutes (no background refetch during this time)
        keepPreviousData: true,   // Keeps the previously fetched data visible while new data loads
    });

    const tutorials = data?.tutorials || []; // Safely access tutorials array, default to empty array

    // ---
    // Event handlers for filter changes
    // These handlers update the URL's search parameters using `useNavigate`.
    // Updating the URL then triggers the `useEffect` above, which updates the component's state,
    // and finally, `useQuery` detects the state change and initiates a new data fetch.
    // This pattern ensures URL synchronization for shareability and consistent state.
    // ---

    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission (page reload)
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('searchTerm', sidebarSearchTerm); // Update the 'searchTerm' parameter with the input value
        navigate({ search: urlParams.toString() });     // Navigate to the new URL with updated parameters
        // The `useEffect` hooked to `location.search` will then update the `searchTerm` state for `useQuery`.
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('category', newCategory); // Update the 'category' parameter
        navigate({ search: urlParams.toString() });
    };

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('sort', newSort); // Update the 'sort' parameter
        navigate({ search: urlParams.toString() });
    };

    // ---
    // Simulate fetching dynamic categories for the filter dropdown
    // In a real application, you would replace this Promise with an actual API call
    // to your backend (e.g., `axios.get('/api/tutorials/categories')`).
    // This makes your category options dynamic and easily manageable from the backend.
    // ---
    const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } = useQuery({
        queryKey: ['tutorialCategories'], // Unique key for caching categories
        queryFn: async () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        'JavaScript', 'React.js', 'Next.js', 'CSS', 'HTML', 'Node.js', 'C++', 'Python', 'Go', 'PHP', 'TypeScript', 'Data Science', 'Machine Learning'
                    ]);
                }, 500); // Simulate a short network delay
            });
        },
        staleTime: Infinity, // Categories rarely change, so they can be cached indefinitely
    });

    const availableCategories = categoriesData || []; // Safely access categories, default to empty array

    return (
        <div className="p-3 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-center my-10 leading-tight text-gray-900 dark:text-white">
                Explore All Tutorials
            </h1>

            {/* Filter and Search Section */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
                <form onSubmit={handleSearchSubmit} className="flex gap-4 w-full md:w-auto">
                    <TextInput
                        type="text"
                        placeholder="Search tutorials..."
                        value={sidebarSearchTerm}
                        onChange={(e) => setSidebarSearchTerm(e.target.value)}
                        className="flex-grow md:flex-grow-0"
                    />
                    <Button type="submit" gradientDuoTone="purpleToBlue">Search</Button>
                </form>

                <div className="flex gap-4 w-full md:w-auto">
                    <Select value={category} onChange={handleCategoryChange} className="min-w-[150px]">
                        <option value="uncategorized">All Categories</option>
                        {categoriesLoading ? (
                            <option disabled>Loading categories...</option> // Show loading state for categories
                        ) : categoriesError ? (
                            <option disabled>Error loading categories</option> // Show error state for categories
                        ) : (
                            // Map over fetched categories to create dropdown options
                            availableCategories.map((cat, index) => (
                                <option key={index} value={cat.toLowerCase().replace(/\s/g, '-')}>{cat}</option>
                            ))
                        )}
                    </Select>

                    <Select value={sort} onChange={handleSortChange} className="min-w-[120px]">
                        <option value="desc">Latest</option>
                        <option value="asc">Oldest</option>
                    </Select>
                </div>
            </div>

            {/* Loading, Error, and No Results States */}
            {isLoading && (
                <div className="flex justify-center items-center h-96">
                    <Spinner size="xl" />
                </div>
            )}
            {isError && (
                <Alert color="failure" className="text-center mx-auto max-w-lg animate-fade-in">
                    Error loading tutorials: {error?.message || 'Please try again.'}
                </Alert>
            )}
            {!isLoading && tutorials.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-lg my-12 animate-fade-in">
                    No tutorials found matching your criteria. Try adjusting your search or filters!
                </p>
            )}

            {/* Tutorials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10">
                {!isLoading && tutorials.map((tutorial) => (
                    // `TutorialCard` should be imported from `../components/TutorialCard`
                    <TutorialCard key={tutorial._id} tutorial={tutorial} />
                ))}
            </div>
        </div>
    );
}