import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTutorials } from '../services/tutorialService';
import { Spinner, Alert, Button, Progress } from 'flowbite-react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import hljs from 'highlight.js';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

// Reusable components
import ReadingProgressBar from '../components/ReadingProgressBar';
import TableOfContents from '../components/TableOfContents';
import SocialShare from '../components/SocialShare';
import { calculateReadingTime } from '../utils/helpers';
import useUser from '../hooks/useUser';
import CommentSection from '../components/CommentSection';
import CodeEditor from '../components/CodeEditor';
import QuizComponent from '../components/QuizComponent';

import '../Tiptap.css';
import '../pages/Scrollbar.css';

import { FaCode, FaQuestionCircle } from 'react-icons/fa';
import { HiCheckCircle, HiExternalLink } from 'react-icons/hi';

const generateSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
};

const getTextFromNode = (node) => {
    if (node.type === 'text') return node.data;
    if (node.type !== 'tag' || !node.children) return '';
    return node.children.map(getTextFromNode).join('');
};

const TutorialPageSkeleton = () => (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen animate-pulse'>
        <div className='bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 p-8 rounded-lg shadow-xl mb-12'>
            <div className='h-12 bg-gray-300 dark:bg-gray-600 rounded-md max-w-xl mx-auto mb-4'></div>
            <div className='h-8 bg-gray-300 dark:bg-gray-600 rounded-md max-w-3xl mx-auto mb-6'></div>
            <div className='h-40 bg-gray-300 dark:bg-gray-600 rounded-lg w-full'></div>
            <div className='flex justify-center items-center mt-6'>
                <div className='w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mr-3'></div>
                <div className='h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded-full'></div>
            </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            <div className='lg:col-span-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg h-[400px]'></div>
            <div className='lg:col-span-3 bg-gray-200 dark:bg-gray-700 p-8 rounded-lg min-h-[600px]'>
                <div className='h-8 w-2/3 bg-gray-300 dark:bg-gray-600 rounded-md mb-6'></div>
                <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded-full mb-3'></div>
                <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded-full mb-3'></div>
                <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-5/6'></div>
            </div>
        </div>
    </main>
);

export default function SingleTutorialPage() {
    const { tutorialSlug, chapterSlug } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['tutorial', tutorialSlug],
        queryFn: () => getTutorials(`slug=${tutorialSlug}`),
        staleTime: 1000 * 60 * 10,
    });

    const tutorial = data?.tutorials?.[0];
    const { user: author, isLoading: isAuthorLoading } = useUser(tutorial?.authorId);
    const { currentUser } = useSelector((state) => state.user);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(0);

    const activeChapter = useMemo(() => {
        if (!tutorial || !tutorial.chapters || tutorial.chapters.length === 0) return null;

        let chapterToUse = null;
        if (chapterSlug) {
            chapterToUse = tutorial.chapters.find(c => c.chapterSlug === chapterSlug);
        } else {
            chapterToUse = tutorial.chapters.sort((a, b) => a.order - b.order)[0];
        }

        if (chapterToUse && !chapterToUse.chapterSlug) {
            chapterToUse.chapterSlug = generateSlug(chapterToUse.chapterTitle);
        }
        return chapterToUse;
    }, [tutorial, chapterSlug]);

    const sanitizedContent = useMemo(() => {
        return activeChapter?.content ? DOMPurify.sanitize(activeChapter.content) : '';
    }, [activeChapter?.content]);

    const headings = useMemo(() => {
        if (!sanitizedContent) return [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedContent;
        const headingNodes = tempDiv.querySelectorAll('h2, h3');
        return Array.from(headingNodes).map(node => ({
            id: generateSlug(node.innerText),
            text: node.innerText,
            level: node.tagName.toLowerCase(),
        }));
    }, [sanitizedContent]);

    const sortedChapters = useMemo(() => {
        return [...(tutorial?.chapters || [])].sort((a, b) => a.order - b.order);
    }, [tutorial?.chapters]);

    const handleMarkComplete = async () => {
        try {
            if (!currentUser) {
                navigate('/sign-in');
                return;
            }
            if (isCompleted) {
                return;
            }

            const res = await fetch(`/api/tutorial/complete/${tutorial._id}/${activeChapter._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.ok) {
                setIsCompleted(true);
                refetch();
            } else {
                const data = await res.json();
                console.error(data.message);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (activeChapter && currentUser) {
            const completed = activeChapter.completedBy && activeChapter.completedBy.includes(currentUser._id);
            setIsCompleted(completed);
        } else {
            setIsCompleted(false);
        }
    }, [activeChapter, currentUser]);

    useEffect(() => {
        if (tutorial && currentUser) {
            const completedChapters = tutorial.chapters.filter(chap =>
                chap.completedBy && chap.completedBy.includes(currentUser._id)
            ).length;
            const totalChapters = tutorial.chapters.length;
            const newPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
            setCompletionPercentage(newPercentage);
        } else {
            setCompletionPercentage(0);
        }
    }, [tutorial, currentUser]);

    useEffect(() => {
        if (tutorial && tutorial.chapters.length > 0) {
            if (!chapterSlug && activeChapter) {
                navigate(`/tutorials/${tutorial.slug}/${activeChapter.chapterSlug}`, { replace: true });
            } else if (chapterSlug && !activeChapter) {
                navigate('/404', { replace: true });
            }
        }
    }, [tutorial, chapterSlug, navigate, activeChapter]);

    useEffect(() => {
        if (activeChapter && (activeChapter.content || activeChapter.initialCode)) {
            hljs.highlightAll();

            const preTags = document.querySelectorAll('.post-content pre');
            preTags.forEach(pre => {
                if (pre.querySelector('.copy-button')) return;

                const button = document.createElement('button');
                button.innerText = 'Copy';
                button.className = 'copy-button absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200';

                button.addEventListener('click', () => {
                    const codeElement = pre.querySelector('code');
                    if (codeElement) {
                        navigator.clipboard.writeText(codeElement.innerText).then(() => {
                            button.innerText = 'Copied!';
                            setTimeout(() => { button.innerText = 'Copy'; }, 2000);
                        }).catch(err => {
                            console.error('Failed to copy text: ', err);
                            button.innerText = 'Error!';
                        });
                    }
                });
                pre.style.position = 'relative';
                pre.classList.add('group');
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
    if (!activeChapter) return <div className='text-center my-20 text-gray-700 dark:text-gray-300'>Chapter not found or tutorial has no chapters.</div>;

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
            if (domNode.type === 'tag' && domNode.name === 'code') {
                const codeText = domNode.children[0]?.data;
                const language = domNode.attribs['class']?.replace('language-', '') || 'text';

                return (
                    <div className="flex flex-col items-center my-4">
                        <div className="w-full relative group">
                             <pre className={`p-4 rounded-lg bg-gray-800 text-white language-${language} overflow-x-auto text-sm`}>
                                 <code dangerouslySetInnerHTML={{ __html: codeText }} />
                             </pre>
                            <Link
                                to='/tryit'
                                state={{ code: codeText, language }}
                                className="absolute bottom-4 right-4"
                            >
                                <Button
                                    gradientDuoTone="purpleToBlue"
                                    size="xs"
                                >
                                    <HiExternalLink className="mr-2" />
                                    Try it Yourself
                                </Button>
                            </Link>
                        </div>
                    </div>
                );
            }
            if (domNode.type === 'tag' && domNode.name === 'img') {
                return (
                    <img
                        src={domNode.attribs.src}
                        alt={domNode.attribs.alt || 'tutorial image'}
                        className="my-4 rounded-lg shadow-lg max-w-full h-auto object-contain mx-auto"
                    />
                );
            }
            if (domNode.type === 'tag' && domNode.name === 'video') {
                return (
                    <video
                        src={domNode.attribs.src}
                        controls
                        className="my-4 rounded-lg shadow-lg max-w-full h-auto object-contain mx-auto"
                    />
                );
            }
        }
    };

    const currentChapterIndex = sortedChapters.findIndex(chap => chap._id === activeChapter._id);
    const prevChapter = currentChapterIndex > 0 ? sortedChapters[currentChapterIndex - 1] : null;
    const nextChapter = currentChapterIndex < sortedChapters.length - 1 ? sortedChapters[currentChapterIndex + 1] : null;

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
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <aside className="md:w-72 w-full p-4 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-lg md:h-screen md:sticky md:top-0 overflow-y-auto scrollbar-custom z-10 transition-all duration-300 ease-in-out">
                    <h3 className="text-2xl font-extrabold mb-5 text-gray-900 dark:text-white border-b pb-3 border-gray-300 dark:border-gray-600">{tutorial.title}</h3>
                    <ul className="space-y-3">
                        {sortedChapters.map((chapter) => (
                            <li key={chapter._id}>
                                <Link
                                    to={`/tutorials/${tutorial.slug}/${chapter.chapterSlug}`}
                                    className={`flex items-center p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-700 transition-all duration-200 ease-in-out group ${
                                        activeChapter?._id === chapter._id
                                            ? 'bg-blue-600 dark:bg-blue-700 text-white font-semibold shadow-md'
                                            : 'text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-100'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full mr-3 ${activeChapter?._id === chapter._id ? 'bg-white' : 'bg-blue-400 group-hover:bg-blue-200'}`}></span>
                                    {chapter.chapterTitle}
                                    {currentUser && chapter.completedBy && chapter.completedBy.includes(currentUser._id) && (
                                        <HiCheckCircle className="ml-auto text-green-300 dark:text-green-500 text-lg" />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="flex-1 p-8 overflow-x-hidden">
                    <h1 className='text-4xl lg:text-5xl font-extrabold text-center my-8 leading-tight text-gray-900 dark:text-white'>{tutorial.title}</h1>
                    <p className='text-xl text-gray-600 dark:text-gray-400 text-center max-w-4xl mx-auto mb-12 font-light'>{tutorial.description}</p>

                    <div className='flex justify-center items-center text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto border-b border-t py-4 mb-10 transition-all duration-300 ease-in-out'>
                        <div className="flex items-center mx-4">
                            <img src={author?.profilePicture || 'https://via.placeholder.com/40'} alt={author?.username} className='w-10 h-10 rounded-full object-cover mr-3 border-2 border-blue-400' />
                            <span>By <span className="font-semibold text-gray-700 dark:text-gray-200">{author?.username || 'Loading Author...'}</span></span>
                        </div>
                        <span className="mx-4">&bull;</span>
                        <span className="mx-4">{calculateReadingTime(activeChapter.content)} min read</span>
                    </div>

                    {/* NEW: Progress bar for the current tutorial */}
                    {currentUser && completionPercentage > 0 && (
                        <div className="max-w-6xl mx-auto my-8">
                            <p className="text-center font-bold text-lg mb-2">
                                Tutorial Progress: {completionPercentage}%
                            </p>
                            <Progress progress={completionPercentage} size="lg" color="blue" />
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                        <div className="lg:w-3/4 w-full">
                            <h2 className='text-3xl lg:text-4xl font-bold my-6 text-gray-900 dark:text-white leading-tight'>{activeChapter.chapterTitle}</h2>

                            {activeChapter.contentType === 'code-interactive' && (
                                <div className='bg-gray-800 p-4 rounded-md text-white my-4'>
                                    <h3 className='text-xl font-semibold mb-3 flex items-center gap-2'><FaCode /> Try it yourself!</h3>
                                    <div className='post-content tiptap mb-4' dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

                                    <CodeEditor
                                        initialCode={activeChapter.initialCode || ''}
                                        language={activeChapter.codeLanguage || 'html'}
                                    />
                                </div>
                            )}

                            {activeChapter.contentType === 'quiz' && activeChapter.quizId && (
                                <div className='my-8 p-4 border border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20'>
                                    <h3 className='text-xl font-semibold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300'><FaQuestionCircle /> Test Your Knowledge!</h3>
                                    <div className='post-content tiptap mb-4' dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                                    <QuizComponent quizId={activeChapter.quizId} />
                                </div>
                            )}

                            {activeChapter.contentType === 'text' && (
                                <div className='post-content tiptap p-3 max-w-full mx-auto leading-relaxed text-lg text-gray-700 dark:text-gray-300'>
                                    {parse(sanitizedContent, parserOptions)}
                                </div>
                            )}
                        </div>

                        <div className="lg:w-1/4 w-full sticky top-8 h-fit self-start hidden lg:block">
                            <TableOfContents headings={headings} />
                        </div>
                    </div>

                    {currentUser && !isCompleted && (
                        <div className="flex justify-center mt-8">
                            <Button
                                gradientDuoTone='greenToBlue'
                                onClick={handleMarkComplete}
                                disabled={!activeChapter}
                            >
                                Mark as Complete
                            </Button>
                        </div>
                    )}
                    {currentUser && isCompleted && (
                        <div className="flex justify-center mt-8">
                            <Alert color='success' className="max-w-md">
                                <span className="font-medium">Chapter Completed!</span> You have finished this chapter.
                            </Alert>
                        </div>
                    )}

                    <div className="max-w-2xl mx-auto w-full my-12 flex justify-center border-t pt-8 border-gray-200 dark:border-gray-700">
                        <SocialShare post={tutorial} />
                    </div>

                    <div className="max-w-4xl mx-auto w-full">
                        <CommentSection tutorialId={tutorial._id} />
                    </div>


                    <div className="flex justify-between max-w-3xl mx-auto mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
                        {prevChapter ? (
                            <Link to={`/tutorials/${tutorial.slug}/${prevChapter.chapterSlug}`} className="flex-1 mr-4">
                                <Button outline gradientDuoTone="purpleToBlue" className="w-full flex flex-col items-start px-4 py-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Previous Chapter</span>
                                    <span className="text-base font-semibold text-left">{prevChapter.chapterTitle}</span>
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex-1 mr-4"></div>
                        )}
                        {nextChapter ? (
                            <Link to={`/tutorials/${tutorial.slug}/${nextChapter.chapterSlug}`} className="flex-1 ml-4">
                                <Button gradientDuoTone="purpleToPink" className="w-full flex flex-col items-end px-4 py-2">
                                    <span className="text-xs text-gray-200 mb-1">Next Chapter</span>
                                    <span className="text-base font-semibold text-right">{nextChapter.chapterTitle}</span>
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex-1 ml-4"></div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}