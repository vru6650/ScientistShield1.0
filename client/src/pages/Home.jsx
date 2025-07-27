import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Alert } from 'flowbite-react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer'; // For advanced viewport animations

// Component and Service Imports
import PostCard from '../components/PostCard';
import PostCardSkeleton from '../components/skeletons/PostCardSkeleton';
import Hero from '../components/Hero';
import { getPosts } from '../services/postService';

// --- UPGRADE 1: Refactored PostListSection for Better UX ---
// It now provides clear feedback for error, loading, and empty states
// instead of just disappearing from the UI.
const PostListSection = ({ title, posts, isLoading, isError, error }) => {
    // Use useInView for more controlled and performant animations
    const { ref, inView } = useInView({
        triggerOnce: true, // Animation triggers only once when entering viewport
        threshold: 0.1,    // Start animation when 10% of element is visible
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }, // Added delayChildren
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0, scale: 0.95 }, // More distinct initial state
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.6
            },
        },
    };

    const renderContent = () => {
        if (isLoading) {
            // Consistent skeleton count for layout stability
            return Array.from({ length: 3 }).map((_, index) => <PostCardSkeleton key={index} />);
        }
        if (isError) {
            return (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-center text-red-500 p-6 rounded-lg bg-red-50 dark:bg-red-900/20 text-lg shadow-md mx-auto max-w-xl' // Enhanced styling
                >
                    Oops! Something went wrong. <span className='font-semibold'>{error?.message || 'We could not load posts for this section.'}</span> Please try refreshing the page.
                </motion.p>
            );
        }
        if (!posts || posts.length === 0) {
            return (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-center text-gray-500 p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-lg shadow-md mx-auto max-w-xl' // Enhanced styling
                >
                    No posts found in this section yet. <span className='font-semibold'>Be the first to create one!</span>
                </motion.p>
            );
        }
        return posts.map((post) => (
            <motion.div key={post._id} variants={itemVariants}>
                <PostCard post={post} />
            </motion.div>
        ));
    };

    return (
        <section className='flex flex-col gap-8'> {/* Increased gap */}
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}} // Animate heading when in view
                transition={{ duration: 0.5, delay: 0.1 }}
                className='text-4xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent drop-shadow-md lg:text-5xl' // Gradient heading, larger
            >
                {title}
            </motion.h2>
            <motion.div
                ref={ref} // Attach ref for useInView
                className='flex min-h-[26rem] flex-wrap items-stretch justify-center gap-8 p-3' // Increased gap, items-stretch for consistent height
                variants={containerVariants}
                initial='hidden'
                animate={inView ? 'visible' : 'hidden'} // Animate container when in view
            >
                {renderContent()}
            </motion.div>
        </section>
    );
};

// --- UPGRADE 2: Centralized Configuration ---
const FEATURED_CATEGORIES = ['React', 'Node.js', 'CSS'];

export default function Home() {
    // Fetches the single latest post
    const { data: featuredPost, isLoading: isLoadingFeatured, isError: isErrorFeatured, error: featuredError } = useQuery({
        queryKey: ['posts', { limit: 1 }],
        queryFn: () => getPosts({ limit: 1 }).then(data => data.posts[0]),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: true,
        retry: 2, // Retry failed queries
    });

    // NEW: Fetch for most clapped posts
    const { data: mostClappedPosts, isLoading: isLoadingClapped, isError: isErrorClapped, error: clappedError } = useQuery({
        queryKey: ['posts', 'most-clapped', { limit: 3 }],
        queryFn: () => getPosts({ sort: 'claps', order: 'desc', limit: 3 }).then(data => data.posts),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: true,
        retry: 2,
    });

    // NEW: Fetch for "Editor's Picks" or "Recommended" posts
    const { data: editorsPicks, isLoading: isLoadingPicks, isError: isErrorPicks, error: picksError } = useQuery({
        queryKey: ['posts', 'editors-picks', { limit: 3, tag: 'editors-pick' }],
        queryFn: () => getPosts({ limit: 3, tag: 'editors-pick' }).then(data => data.posts),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    // --- UPGRADE 3: More Declarative Data Handling ---
    const categoryQueryResults = useQueries({
        queries: FEATURED_CATEGORIES.map(category => ({
            queryKey: ['posts', { category, limit: 3 }],
            queryFn: () => getPosts({ category, limit: 3 }).then(data => data.posts),
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: true,
            retry: 2,
        })),
    });

    // Combine query results with their metadata (the category name) to avoid relying on index in the JSX.
    const categorySections = FEATURED_CATEGORIES.map((category, index) => ({
        categoryName: category,
        ...categoryQueryResults[index],
    }));

    return (
        <main>
            <Helmet>
                <title>My Awesome Blog | Home</title>
                <meta name="description" content="Welcome to my awesome blog where I share tutorials and articles about web development, programming, and more." />
            </Helmet>

            <Hero />

            <div className='relative z-10 mx-auto max-w-7xl flex flex-col gap-20 p-3 py-12'> {/* Increased gap and padding */}
                {/* Global error for the main featured post (if applicable) */}
                {isErrorFeatured && (
                    <Alert color='failure' className='text-center mx-auto max-w-xl shadow-lg'>
                        <span className='font-bold'>Error loading latest post:</span> {featuredError.message}
                    </Alert>
                )}

                {/* Featured Post Section */}
                <PostListSection
                    title="Latest Insights" // More engaging title
                    posts={featuredPost ? [featuredPost] : []}
                    isLoading={isLoadingFeatured}
                    isError={isErrorFeatured}
                    error={featuredError}
                />

                {/* Editor's Picks / Recommended Section */}
                <PostListSection
                    title="Handpicked for You" // More personalized title
                    posts={editorsPicks}
                    isLoading={isLoadingPicks}
                    isError={isErrorPicks}
                    error={picksError}
                />

                {/* Most Clapped Posts Section - Highlighting Popular Content */}
                <PostListSection
                    title="Trending Now" // More dynamic title
                    posts={mostClappedPosts}
                    isLoading={isLoadingClapped}
                    isError={isErrorClapped}
                    error={clappedError}
                />

                {/* Render a section for each category using our clean data structure */}
                {categorySections.map(section => (
                    <PostListSection
                        key={section.categoryName}
                        title={`Deep Dive into ${section.categoryName}`} // More engaging category title
                        posts={section.data}
                        isLoading={section.isLoading}
                        isError={section.isError}
                        error={section.error}
                    />
                ))}

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className='text-center mt-10' // Centralize the CTA
                >
                    <Link
                        to={'/search'}
                        className='inline-block px-10 py-4 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xl font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-offset-2'
                    >
                        Browse All Articles <span aria-hidden="true">&rarr;</span>
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}