// client/src/pages/Home.jsx

import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { getPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import Hero from '../components/Hero';
import CategoryCard from '../components/CategoryCard';
import CodeEditor from '../components/CodeEditor';

export default function Home() {
    const [latestPosts, setLatestPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const postsData = await getPosts('limit=3');

                if (postsData && postsData.posts) {
                    setLatestPosts(postsData.posts);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load content. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Display a loading state while fetching data
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500">Loading content...</p>
            </div>
        );
    }

    // Display an error message if fetching fails
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <main>
            <Hero />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <section className="my-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
                        Learn Technology for free
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <CategoryCard
                            title="HTML"
                            description="The language for building web pages"
                            linkTo="/tutorials?category=html"
                            gradient="bg-gradient-to-br from-subtle-gray-400 to-subtle-gray-600"
                            className="animate-card-fade-in"
                            style={{ animationDelay: '0.2s' }}
                        />
                        <CategoryCard
                            title="CSS"
                            description="The language for styling web pages"
                            linkTo="/tutorials?category=css"
                            gradient="bg-gradient-to-br from-professional-blue-400 to-professional-blue-600"
                            className="animate-card-fade-in"
                            style={{ animationDelay: '0.4s' }}
                        />
                        <CategoryCard
                            title="JavaScript"
                            description="The language for programming web pages"
                            linkTo="/tutorials?category=javascript"
                            gradient="bg-gradient-to-br from-subtle-gray-400 to-subtle-gray-600"
                            className="animate-card-fade-in"
                            style={{ animationDelay: '0.6s' }}
                        />
                        <CategoryCard
                            title="React.js"
                            description="A JavaScript library for building user interfaces"
                            linkTo="/tutorials?category=reactjs"
                            gradient="bg-gradient-to-br from-professional-blue-400 to-professional-blue-600"
                            className="animate-card-fade-in"
                            style={{ animationDelay: '0.8s' }}
                        />
                        <CategoryCard
                            title="Node.js"
                            description="A JavaScript runtime built on Chrome's V8 JavaScript engine"
                            linkTo="/tutorials?category=node.js"
                            gradient="bg-gradient-to-br from-subtle-gray-400 to-subtle-gray-600"
                            className="animate-card-fade-in"
                            style={{ animationDelay: '1s' }}
                        />
                        <CategoryCard
                            title="C"
                            description="A powerful general-purpose programming language"
                            linkTo="/tutorials?category=c"
                            gradient="bg-gradient-to-br from-professional-blue-400 to-professional-blue-600"
                            className="animate-card-fade-in"
                            style={{ animationDelay: '1.2s' }}
                        />
                    </div>
                </section>

                <section className="my-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
                        Interactive Code Playground
                    </h2>
                    <CodeEditor />
                </section>

                {latestPosts.length > 0 && (
                    <section className="my-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
                            Recently Published Articles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {latestPosts.map((post, index) => (
                                <div
                                    key={post._id}
                                    className="animate-card-fade-in"
                                    style={{ animationDelay: `${0.2 + index * 0.2}s` }}
                                >
                                    <PostCard post={post} />
                                </div>
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
            </div>
        </main>
    );
}