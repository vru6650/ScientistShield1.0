import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import PostCardSkeleton from '../components/skeletons/PostCardSkeleton.jsx';

// This is just a simulation of fetching data from a server.
// It waits for 2 seconds, then returns a list of posts.
const fetchPosts = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { slug: 'post-1', title: 'First Amazing Post', ... },
                { slug: 'post-2', title: 'A Video Post', ... },
            ]);
        }, 2000);
    });
};

// This is your main page component, e.g., a Blog page.
export default function PostListPage() {
    // 'posts' will hold our data. It starts as an empty array.
    const [posts, setPosts] = useState([]);

    // 'isLoading' is our switch. It starts as 'true'.
    const [isLoading, setIsLoading] = useState(true);

    // This block runs once when the component is first rendered.
    useEffect(() => {
        const loadData = async () => {
            // 1. We start fetching the data from our "server".
            const fetchedPosts = await fetchPosts();

            // 2. Once the data arrives, we put it into our 'posts' state.
            setPosts(fetchedPosts);

            // 3. We flip the 'isLoading' switch to 'false'. This is the key!
            //    Flipping this switch tells React to show the real cards.
            setIsLoading(false);
        };

        loadData();
    }, []); // The empty array [] means "only run this once".

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {isLoading ? (
                // IF 'isLoading' is true, we are here.
                // We create a temporary array of 6 items and show a skeleton for each.
                Array.from({ length: 6 }).map((_, index) => (
                    <PostCardSkeleton key={index} />
                ))
            ) : (
                // IF 'isLoading' is false, we are here.
                // We map over the 'posts' array (which now has data) and show a real card for each post.
                posts.map(post => (
                    <PostCard key={post.slug} post={post} />
                ))
            )}
        </div>
    );
}