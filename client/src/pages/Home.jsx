// client/src/pages/Home.jsx

import { Link } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { getPosts } from '../services/postService'; // Assuming you still want to show latest posts
import { getTutorials } from '../services/tutorialService'; // NEW: Import tutorial service
import PostCard from '../components/PostCard'; // For displaying recent posts, if desired

// NEW: Import Icons
import { HiMagnifyingGlass } from 'react-icons/hi2';

// NEW: Define a simple component for a category card
const CategoryCard = ({ title, description, linkTo, gradient }) => (
    <Link to={linkTo} className="block w-full h-full">
        <div className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center ${gradient}`}>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-100 mb-4 text-sm">{description}</p>
            <Button outline className="text-white border-white hover:bg-white hover:text-gray-800">
                Learn {title}
            </Button>
        </div>
    </Link>
);

export default function Home() {
    const [latestPosts, setLatestPosts] = useState([]);
    const [trendingTutorials, setTrendingTutorials] = useState([]); // NEW state for tutorials
    const [searchQuery, setSearchQuery] = useState(''); // NEW state for search input

    useEffect(() => {
        const fetchLatestPosts = async () => {
            try {
                const data = await getPosts('limit=3'); // Fetch latest 3 posts
                if (data.posts) {
                    setLatestPosts(data.posts);
                }
            } catch (error) {
                console.error("Failed to fetch latest posts:", error);
            }
        };

        const fetchTrendingTutorials = async () => {
            try {
                const data = await getTutorials('limit=6&sort=desc'); // Fetch some recent/trending tutorials
                if (data.tutorials) {
                    setTrendingTutorials(data.tutorials);
                }
            } catch (error) {
                console.error("Failed to fetch trending tutorials:", error);
            }
        };

        fetchLatestPosts();
        fetchTrendingTutorials();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // Redirect to a search results page or tutorials page with the search term
        // This is a basic redirect, you might want a dedicated search page
        window.location.href = `/tutorials?searchTerm=${encodeURIComponent(searchQuery)}`;
    };


    return (
        <main>
            {/* Hero Section: W3Schools style - Learn To Code */}
            <section className="bg-gradient-to-r from-cyan-500 to-blue-500 py-20 px-4 sm:px-6 lg:px-8 text-white text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
                    Learn to Code
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto">
                    With the world's largest web developer site.
                </p>
                <form onSubmit={handleSearch} className="flex max-w-xl mx-auto rounded-full overflow-hidden shadow-lg">
                    <TextInput
                        type="text"
                        placeholder="Search our tutorials..."
                        className="flex-grow rounded-l-full [&>div>input]:!rounded-none [&>div>input]:!border-0 [&>div>input]:!ring-0 [&>div>input]:!shadow-none [&>div>input]:bg-white [&>div>input]:placeholder-gray-500 [&>div>input]:text-gray-900 focus:!ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={HiMagnifyingGlass}
                    />
                    <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white !rounded-none rounded-r-full h-11 w-20">
                        Go
                    </Button>
                </form>
            </section>

            {/* Main Content Area - Category Grids */}
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <section className="my-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">
                        Popular Topics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <CategoryCard
                            title="HTML"
                            description="The language for building web pages"
                            linkTo="/tutorials?category=html"
                            gradient="bg-gradient-to-br from-orange-400 to-orange-600"
                        />
                        <CategoryCard
                            title="CSS"
                            description="The language for styling web pages"
                            linkTo="/tutorials?category=css"
                            gradient="bg-gradient-to-br from-blue-400 to-blue-600"
                        />
                        <CategoryCard
                            title="JavaScript"
                            description="The language for programming web pages"
                            linkTo="/tutorials?category=javascript"
                            gradient="bg-gradient-to-br from-yellow-400 to-yellow-600"
                        />
                        <CategoryCard
                            title="React.js"
                            description="A JavaScript library for building user interfaces"
                            linkTo="/tutorials?category=reactjs"
                            gradient="bg-gradient-to-br from-cyan-400 to-blue-400"
                        />
                        <CategoryCard
                            title="Node.js"
                            description="A JavaScript runtime built on Chrome's V8 JavaScript engine"
                            linkTo="/tutorials?category=node.js"
                            gradient="bg-gradient-to-br from-green-500 to-green-700"
                        />
                        <CategoryCard
                            title="C"
                            description="A powerful general-purpose programming language"
                            linkTo="/tutorials?category=c"
                            gradient="bg-gradient-to-br from-gray-600 to-gray-800"
                        />
                        {/* Add more categories as needed */}
                    </div>
                </section>

                {/* Optional: Recently Published Posts Section (retained from old Home) */}
                {latestPosts && latestPosts.length > 0 && (
                    <section className="my-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">
                            Recently Published Articles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {latestPosts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                        <div className="flex justify-center mt-10">
                            <Link to="/search">
                                <Button outline gradientDuoTone="purpleToBlue">
                                    View All Articles
                                </Button>
                            </Link>
                        </div>
                    </section>
                )}

                {/* Optional: Trending Tutorials Section */}
                {trendingTutorials && trendingTutorials.length > 0 && (
                    <section className="my-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">
                            Trending Tutorials
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {trendingTutorials.map((tutorial) => (
                                // You might want a specific TutorialCard component for this
                                // For now, we'll use a basic card or adapt PostCard
                                <CategoryCard
                                    key={tutorial._id}
                                    title={tutorial.title}
                                    description={tutorial.description}
                                    linkTo={`/tutorials/${tutorial.slug}`}
                                    gradient="bg-gradient-to-br from-purple-500 to-pink-500" // Example gradient
                                />
                            ))}
                        </div>
                        <div className="flex justify-center mt-10">
                            <Link to="/tutorials">
                                <Button outline gradientDuoTone="greenToBlue">
                                    View All Tutorials
                                </Button>
                            </Link>
                        </div>
                    </section>
                )}

            </div>
        </main>
    );
}