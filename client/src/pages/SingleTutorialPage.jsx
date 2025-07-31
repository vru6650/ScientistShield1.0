import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSingleTutorial } from '../services/tutorialService';
import { Spinner, Alert, Button } from 'flowbite-react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import hljs from 'highlight.js';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

// Reusable components
import ReadingProgressBar from '../components/ReadingProgressBar';
import TableOfContents from '../components/TableOfContents';
import SocialShare from '../components/SocialShare';
import { calculateReadingTime } from '../utils/helpers';
import useUser from '../hooks/useUser';
import '../Tiptap.css';
import '../pages/Scrollbar.css'; // NEW: Import custom scrollbar styles

// ADD THIS ENTIRE generateSlug FUNCTION HERE
const generateSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
};

// Helper for extracting text content from DOM nodes (from PostPage)
const getTextFromNode = (node) => {
    if (node.type === 'text') return node.data;
    if (node.type !== 'tag' || !node.children) return '';
    return node.children.map(getTextFromNode).join('');
};

// Skeleton component (adapt from PostPageSkeleton if desired for more detail)
const TutorialPageSkeleton = () => (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen animate-pulse'>
        <div className='h-10 bg-gray-300 dark:bg-gray-600 rounded-md mt-10 p-3 max-w-2xl mx-auto w-full'></div>
        <div className='h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded-full self-center mt-5'></div>
        <div className='mt-10 p-3 max-h-[400px] w-full h-72 bg-gray-300 dark:bg-gray-600 rounded-lg'></div>
        <div className='p-3 max-w-2xl mx-auto w-full mt-5'>
            <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-full mb-4'></div>
            <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-full mb-4'></div>
            <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-3/4'></div>
        </div>
    </main>
);

export default function SingleTutorialPage() {
    const { tutorialSlug, chapterSlug } = useParams();
    const navigate = useNavigate();

    const { data: tutorial, isLoading, isError, error } = useQuery({
        queryKey: ['tutorial', tutorialSlug],
        queryFn: () => getSingleTutorial(tutorialSlug),
        staleTime: 1000 * 60 * 10,
    });

    const { user: author, isLoading: isAuthorLoading } = useUser(tutorial?.authorId);

    // Determine the active chapter
    const activeChapter = useMemo(() => {
        if (!tutorial || !tutorial.chapters) return null;
        if (chapterSlug) {
            return tutorial.chapters.find(chapter => chapter.chapterSlug === chapterSlug);
        }
        // If no chapterSlug is provided, default to the first chapter
        return tutorial.chapters.length > 0 ? tutorial.chapters[0] : null;
    }, [tutorial, chapterSlug]);

    // Redirect if tutorial exists but no chapter is active (and there are chapters)
    useEffect(() => {
        if (tutorial && !chapterSlug && tutorial.chapters.length > 0) {
            navigate(`/tutorials/${tutorial.slug}/${tutorial.chapters[0].chapterSlug}`, { replace: true });
        }
    }, [tutorial, chapterSlug, navigate]);

    // Sanitize and parse content for the active chapter
    const sanitizedContent = useMemo(() => {
        return activeChapter?.content ? DOMPurify.sanitize(activeChapter.content) : '';
    }, [activeChapter?.content]);

    // Extract headings for TOC from the *active chapter's* content
    const headings = useMemo(() => {
        if (!sanitizedContent) return [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedContent;
        const headingNodes = tempDiv.querySelectorAll('h2, h3');
        return Array.from(headingNodes).map(node => ({
            id: generateSlug(node.innerText), // This is where generateSlug is used
            text: node.innerText,
            level: node.tagName.toLowerCase(),
        }));
    }, [sanitizedContent]);

    // Effect for syntax highlighting and copy button
    useEffect(() => {
        if (activeChapter?.content) {
            hljs.highlightAll();
            const preTags = document.querySelectorAll('.post-content pre');
            preTags.forEach(pre => {
                if (pre.querySelector('.copy-button')) return;
                const button = document.createElement('button');
                button.innerText = 'Copy';
                button.className = 'copy-button absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200'; // NEW: Styling for copy button
                button.addEventListener('click', () => {
                    const code = pre.querySelector('code').innerText;
                    navigator.clipboard.writeText(code).then(() => {
                        button.innerText = 'Copied!';
                        setTimeout(() => { button.innerText = 'Copy'; }, 2000);
                    });
                });
                pre.style.position = 'relative';
                pre.classList.add('group'); // NEW: Add group class for hover effect on pre
                pre.appendChild(button);
            });
        }
    }, [activeChapter]);

    if (isLoading || isAuthorLoading) return <TutorialPageSkeleton />;
    if (isError) return (
        <div className='flex justify-center items-center min-h-screen'>
            <Alert color='failure' className='text-xl'>Error: {error?.message || 'Failed to load tutorial.'}</Alert>
        </div>
    );
    if (!tutorial) return <div className='text-center my-20 text-gray-700 dark:text-gray-300'>Tutorial not found.</div>;
    if (!activeChapter) return <div className='text-center my-20 text-gray-700 dark:text-gray-300'>No chapters found for this tutorial.</div>;

    const createMetaDescription = (htmlContent) => {
        if (!htmlContent) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        return tempDiv.textContent.trim().slice(0, 155) + '...';
    };

    const parserOptions = {
        replace: domNode => {
            if (domNode.type === 'tag' && (domNode.name === 'h2' || domNode.name === 'h3')) {
                const textContent = getTextFromNode(domNode);
                const id = generateSlug(textContent);
                if (id) domNode.attribs.id = id;
                return;
            }
            // Add image rendering logic if needed, similar to PostPage
        }
    };

    const currentChapterIndex = tutorial.chapters.findIndex(chap => chap._id === activeChapter._id);
    const prevChapter = currentChapterIndex > 0 ? tutorial.chapters[currentChapterIndex - 1] : null;
    const nextChapter = currentChapterIndex < tutorial.chapters.length - 1 ? tutorial.chapters[currentChapterIndex + 1] : null;

    return (
        <>
            <Helmet>
                <title>{activeChapter.chapterTitle} - {tutorial.title}</title>
                <meta name="description" content={createMetaDescription(activeChapter.content)} />
                <meta property="og:title" content={`${activeChapter.chapterTitle} - ${tutorial.title}`} />
                <meta property="og:description" content={createMetaDescription(activeChapter.content)} />
                <meta property="og:image" content={tutorial.thumbnail} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
            </Helmet>

            <ReadingProgressBar />
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"> {/* NEW: Overall background and text color */}
                {/* Left Sidebar for Tutorial Chapters */}
                <aside className="md:w-72 w-full p-4 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-lg md:h-screen md:sticky md:top-0 overflow-y-auto scrollbar-custom z-10 transition-all duration-300 ease-in-out"> {/* NEW: Increased width, sticky, shadow, custom scrollbar */}
                    <h3 className="text-2xl font-extrabold mb-5 text-gray-900 dark:text-white border-b pb-3 border-gray-300 dark:border-gray-600">{tutorial.title}</h3> {/* NEW: Larger title, border */}
                    <ul className="space-y-3"> {/* NEW: Increased spacing */}
                        {tutorial.chapters
                            .sort((a, b) => a.order - b.order)
                            .map((chapter) => (
                                <li key={chapter._id}>
                                    <Link
                                        to={`/tutorials/${tutorial.slug}/${chapter.chapterSlug}`}
                                        className={`flex items-center p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-700 transition-all duration-200 ease-in-out group ${ // NEW: Transition for better hover effect
                                            activeChapter._id === chapter._id
                                                ? 'bg-blue-600 dark:bg-blue-700 text-white font-semibold shadow-md' // NEW: Stronger active state
                                                : 'text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-100' // NEW: Hover text color
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full mr-3 ${activeChapter._id === chapter._id ? 'bg-white' : 'bg-blue-400 group-hover:bg-blue-200'}`}></span> {/* NEW: Chapter bullet */}
                                        {chapter.chapterTitle}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-x-hidden"> {/* NEW: Prevent horizontal scroll issue */}
                    <h1 className='text-4xl lg:text-5xl font-extrabold text-center my-8 leading-tight text-gray-900 dark:text-white'>{tutorial.title}</h1> {/* NEW: Larger font, better line height */}
                    <p className='text-xl text-gray-600 dark:text-gray-400 text-center max-w-4xl mx-auto mb-12 font-light'>{tutorial.description}</p> {/* NEW: Larger description, lighter font */}

                    <div className='flex justify-center items-center text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto border-b border-t py-4 mb-10 transition-all duration-300 ease-in-out'> {/* NEW: Borders top/bottom, transition */}
                        <div className="flex items-center mx-4">
                            <img src={author?.profilePicture || 'https://via.placeholder.com/40'} alt={author?.username} className='w-10 h-10 rounded-full object-cover mr-3 border-2 border-blue-400' /> {/* NEW: Author image border */}
                            <span>By <span className="font-semibold text-gray-700 dark:text-gray-200">{author?.username || 'Loading Author...'}</span></span>
                        </div>
                        <span className="mx-4">&bull;</span>
                        <span className="mx-4">{calculateReadingTime(activeChapter.content)} min read</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto"> {/* NEW: Two-column layout for main content + TOC */}
                        <div className="lg:w-3/4 w-full"> {/* Main content column */}
                            <h2 className='text-3xl lg:text-4xl font-bold my-6 text-gray-900 dark:text-white leading-tight'>{activeChapter.chapterTitle}</h2> {/* NEW: Larger chapter title */}

                            {/* Render chapter content using html-react-parser */}
                            <div className='post-content tiptap p-3 max-w-full mx-auto leading-relaxed text-lg text-gray-700 dark:text-gray-300'> {/* NEW: Adjusted padding, line height, text size */}
                                {parse(sanitizedContent, parserOptions)}
                            </div>
                        </div>

                        <div className="lg:w-1/4 w-full sticky top-8 h-fit self-start hidden lg:block"> {/* NEW: TOC column, sticky */}
                            <TableOfContents headings={headings} />
                        </div>
                    </div>


                    <div className="max-w-2xl mx-auto w-full my-12 flex justify-center border-t pt-8 border-gray-200 dark:border-gray-700"> {/* NEW: Centered, border top */}
                        <SocialShare post={tutorial} />
                    </div>

                    {/* Navigation between chapters */}
                    <div className="flex justify-between max-w-3xl mx-auto mt-12 py-6 border-t border-gray-200 dark:border-gray-700"> {/* NEW: Larger max-width, padding, border */}
                        {prevChapter ? (
                            <Link to={`/tutorials/${tutorial.slug}/${prevChapter.chapterSlug}`} className="flex-1 mr-4"> {/* NEW: Flex-1 and margin for spacing */}
                                <Button outline gradientDuoTone="purpleToBlue" className="w-full flex flex-col items-start px-4 py-2"> {/* NEW: Full width button, flex column for text */}
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Previous Chapter</span>
                                    <span className="text-base font-semibold text-left">{prevChapter.chapterTitle}</span>
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex-1 mr-4"></div> // Placeholder to maintain layout
                        )}
                        {nextChapter ? (
                            <Link to={`/tutorials/${tutorial.slug}/${nextChapter.chapterSlug}`} className="flex-1 ml-4"> {/* NEW: Flex-1 and margin for spacing */}
                                <Button gradientDuoTone="purpleToPink" className="w-full flex flex-col items-end px-4 py-2"> {/* NEW: Full width button, flex column for text */}
                                    <span className="text-xs text-gray-200 mb-1">Next Chapter</span>
                                    <span className="text-base font-semibold text-right">{nextChapter.chapterTitle}</span>
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex-1 ml-4"></div> // Placeholder to maintain layout
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}