import { Alert, Button, FileInput, Select, TextInput, Spinner, Modal } from 'flowbite-react';
import TiptapEditor from '../components/TiptapEditor';
import { useState, useReducer, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { createTutorial as createTutorialService } from '../services/tutorialService';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useQuery } from '@tanstack/react-query';
import { FaTrash, FaPlus } from 'react-icons/fa'; // Removed FaArrowUp, FaArrowDown as drag-and-drop handles order visually

// Using react-dnd for drag-and-drop. You'll need to install it.
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DRAFT_KEY_TUTORIAL = 'tutorialDraft'; // Separate draft key for tutorials

const tutorialInitialState = {
    formData: {
        title: '',
        description: '',
        category: 'uncategorized',
        thumbnail: 'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
        chapters: [],
    },
    publishError: null,
    loading: false,
};

// Helper to reorder array elements (used in reducer)
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Reassign order property based on new array order
    return result.map((item, index) => ({ ...item, order: index + 1 }));
};

function tutorialReducer(state, action) {
    switch (action.type) {
        case 'FIELD_CHANGE':
            return { ...state, formData: { ...state.formData, ...action.payload } };
        case 'ADD_CHAPTER_FIELD': // Add an empty chapter to the form
            return {
                ...state,
                formData: {
                    ...state.formData,
                    chapters: [...state.formData.chapters, {
                        chapterTitle: '',
                        chapterSlug: '',
                        content: '',
                        order: state.formData.chapters.length + 1
                    }]
                }
            };
        case 'UPDATE_CHAPTER_FIELD': // Update a specific chapter's field
            return {
                ...state,
                formData: {
                    ...state.formData,
                    chapters: state.formData.chapters.map((chapter, index) =>
                        index === action.payload.index
                            ? { ...chapter, [action.payload.field]: action.payload.value }
                            : chapter
                    ),
                },
            };
        case 'REMOVE_CHAPTER': // Remove a chapter
            return {
                ...state,
                formData: {
                    ...state.formData,
                    // Reassign order after removal
                    chapters: state.formData.chapters
                        .filter((_, index) => index !== action.payload.index)
                        .map((chapter, i) => ({ ...chapter, order: i + 1 })),
                },
            };
        case 'REORDER_CHAPTERS': // Action to reorder chapters
            return {
                ...state,
                formData: {
                    ...state.formData,
                    chapters: reorder(state.formData.chapters, action.payload.startIndex, action.payload.endIndex)
                }
            };
        case 'THUMBNAIL_UPLOAD_SUCCESS':
            return { ...state, formData: { ...state.formData, thumbnail: action.payload } };
        case 'PUBLISH_START':
            return { ...state, loading: true, publishError: null };
        case 'PUBLISH_SUCCESS':
            return { ...tutorialInitialState }; // Reset form after success
        case 'PUBLISH_ERROR':
            return { ...state, loading: false, publishError: action.payload };
        case 'LOAD_DRAFT':
            return { ...state, formData: action.payload };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

const generateSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
};

// Item type for react-dnd
const ItemTypes = {
    CHAPTER: 'chapter',
};

// Chapter component for drag-and-drop
const DraggableChapter = ({ chapter, index, totalChapters, dispatch, handleChapterFieldChange, handleChapterContentChange, moveChapter }) => {
    const ref = useRef(null);

    // useDrag hook for making the chapter draggable
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CHAPTER,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    // useDrop hook for making the chapter a drop target
    const [, drop] = useDrop({
        accept: ItemTypes.CHAPTER,
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Time to actually perform the action
            moveChapter(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations in render functions and side effects
            // but for performance reasons and simplicity for this case, it's acceptable.
            item.index = hoverIndex;
        },
    });

    drag(drop(ref)); // Attach both drag and drop capabilities to the same ref

    const opacity = isDragging ? 0.5 : 1;

    return (
        <div
            ref={ref}
            style={{ opacity }}
            className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 relative mb-4 transition-all duration-200 ease-in-out shadow-md"
        >
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chapter {chapter.order}</h3>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        color="red"
                        size="sm"
                        onClick={() => dispatch({ type: 'REMOVE_CHAPTER', payload: { index } })}
                        className="p-1"
                        title="Remove Chapter"
                    >
                        <FaTrash />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <TextInput
                    type='text'
                    placeholder='Chapter Title'
                    required
                    value={chapter.chapterTitle}
                    onChange={(e) => handleChapterFieldChange(index, 'chapterTitle', e.target.value)}
                    className="w-full"
                />
                <TextInput
                    type='text'
                    placeholder='chapter-slug'
                    value={chapter.chapterSlug}
                    readOnly
                    disabled
                    className="w-full"
                />
            </div>
            <TiptapEditor
                content={chapter.content}
                onChange={(newContent) => handleChapterContentChange(index, newContent)}
                placeholder={`Write content for Chapter ${chapter.order}...`}
            />
        </div>
    );
};

export default function CreateTutorial() {
    const [state, dispatch] = useReducer(tutorialReducer, tutorialInitialState);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const { upload, progress: uploadProgress, error: uploadError, isUploading } = useCloudinaryUpload();
    const navigate = useNavigate();

    // Fetch dynamic categories
    const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } = useQuery({
        queryKey: ['tutorialCategories'],
        queryFn: async () => {
            // Replace with actual API call to get categories from your backend
            // Example: const response = await fetch('/api/categories'); return response.json();
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        'JavaScript', 'React.js', 'Next.js', 'CSS', 'HTML', 'Node.js', 'Python', 'Web Development', 'Databases', 'DevOps'
                    ]);
                }, 500);
            });
        },
        staleTime: Infinity, // Categories don't change often
    });

    const availableCategories = categoriesData || [];

    // Draft handling
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY_TUTORIAL);
        if (savedDraft) {
            const draftData = JSON.parse(savedDraft);
            // Check if draft has meaningful content (title or any chapter content)
            if (draftData.title || (draftData.chapters && draftData.chapters.some(c => c.content?.replace(/<(.|\n)*?>/g, '').trim().length > 0))) {
                setShowDraftModal(true);
            }
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            // Only save draft if there's substantial content
            if (state.formData.title || (state.formData.chapters && state.formData.chapters.some(c => c.content?.replace(/<(.|\n)*?>/g, '').trim().length > 0))) {
                localStorage.setItem(DRAFT_KEY_TUTORIAL, JSON.stringify(state.formData));
            } else {
                // If content becomes empty, remove the draft
                localStorage.removeItem(DRAFT_KEY_TUTORIAL);
            }
        }, 2000);
        return () => clearTimeout(handler);
    }, [state.formData]);

    const handleRestoreDraft = () => {
        const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY_TUTORIAL));
        dispatch({ type: 'LOAD_DRAFT', payload: savedDraft });
        setShowDraftModal(false);
    };

    const handleDismissDraft = () => {
        localStorage.removeItem(DRAFT_KEY_TUTORIAL);
        setShowDraftModal(false);
    };

    const handleThumbnailChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            dispatch({ type: 'PUBLISH_ERROR', payload: 'Please select a thumbnail image.' });
            return;
        }

        try {
            const url = await upload(file, {
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                maxSizeMB: 5,
            });
            dispatch({ type: 'THUMBNAIL_UPLOAD_SUCCESS', payload: url });
            dispatch({ type: 'PUBLISH_ERROR', payload: null }); // Clear any previous error
        } catch (err) {
            dispatch({ type: 'PUBLISH_ERROR', payload: err.message || 'Failed to upload thumbnail.' });
            console.error('Thumbnail upload error:', err);
        }
    };

    const handleMainFieldChange = (e) => {
        const { id, value } = e.target;
        const payload = { [id]: value };
        if (id === 'title') {
            payload.slug = generateSlug(value);
        }
        dispatch({ type: 'FIELD_CHANGE', payload });
    };

    const handleChapterContentChange = (index, newContent) => {
        // Ensure that chapter content is always normalized to an empty string if Tiptap returns null/undefined
        const contentToSave = newContent === undefined || newContent === null ? '' : newContent;
        dispatch({ type: 'UPDATE_CHAPTER_FIELD', payload: { index, field: 'content', value: contentToSave } });
    };


    const handleChapterFieldChange = (index, field, value) => {
        if (field === 'chapterTitle') {
            const newSlug = generateSlug(value);
            dispatch({ type: 'UPDATE_CHAPTER_FIELD', payload: { index, field: 'chapterTitle', value } });
            dispatch({ type: 'UPDATE_CHAPTER_FIELD', payload: { index, field: 'chapterSlug', value: newSlug } });
        } else if (field === 'order') {
            // Prevent directly setting order via input if using drag and drop for reordering
            // We'll let drag and drop manage the order field
            console.warn("Manual order change is disabled. Use drag-and-drop to reorder chapters.");
        } else {
            dispatch({ type: 'UPDATE_CHAPTER_FIELD', payload: { index, field, value } });
        }
    };

    const moveChapter = (dragIndex, hoverIndex) => {
        dispatch({ type: 'REORDER_CHAPTERS', payload: { startIndex: dragIndex, endIndex: hoverIndex } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: 'PUBLISH_START' });

        // Enhanced Validation
        if (!state.formData.title.trim()) {
            return dispatch({ type: 'PUBLISH_ERROR', payload: 'Tutorial Title is required.' });
        }
        if (!state.formData.description.trim()) {
            return dispatch({ type: 'PUBLISH_ERROR', payload: 'Tutorial Description is required.' });
        }
        if (state.formData.category === 'uncategorized') {
            return dispatch({ type: 'PUBLISH_ERROR', payload: 'Please select a category for the tutorial.' });
        }
        if (!state.formData.thumbnail || state.formData.thumbnail === tutorialInitialState.formData.thumbnail) {
            return dispatch({ type: 'PUBLISH_ERROR', payload: 'Please upload a custom thumbnail for your tutorial.' });
        }
        if (state.formData.chapters.length === 0) {
            return dispatch({ type: 'PUBLISH_ERROR', payload: 'A tutorial must have at least one chapter.' });
        }

        // Validate each chapter
        for (const chapter of state.formData.chapters) {
            if (!chapter.chapterTitle.trim()) {
                return dispatch({ type: 'PUBLISH_ERROR', payload: `Chapter ${chapter.order}: Title is required.` });
            }
            // Remove HTML tags and check if content is empty or only whitespace
            if (!chapter.content || chapter.content.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
                return dispatch({ type: 'PUBLISH_ERROR', payload: `Chapter ${chapter.order}: Content cannot be empty.` });
            }
        }

        try {
            const data = await createTutorialService(state.formData);
            dispatch({ type: 'PUBLISH_SUCCESS' });
            localStorage.removeItem(DRAFT_KEY_TUTORIAL);
            navigate(`/tutorials/${data.slug}`);
        } catch (error) {
            console.error('Publish error:', error);
            dispatch({ type: 'PUBLISH_ERROR', payload: error.message || 'An unexpected error occurred during publishing.' });
        }
    };

    return (
        <DndProvider backend={HTML5Backend}> {/* Wrap the component with DndProvider */}
            <div className='p-3 max-w-4xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200'>
                <h1 className='text-center text-4xl my-8 font-extrabold text-gray-900 dark:text-white'>Create a New Tutorial</h1>
                <form className='flex flex-col gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg' onSubmit={handleSubmit}>
                    {/* Main Tutorial Details */}
                    <div className='flex flex-col gap-5'>
                        <div>
                            <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Tutorial Title</label>
                            <TextInput
                                type='text'
                                placeholder='e.g., Mastering React Hooks'
                                required
                                id='title'
                                value={state.formData.title}
                                onChange={handleMainFieldChange}
                                className='w-full'
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Description</label>
                            <TextInput
                                type='text'
                                placeholder='A brief overview of the tutorial content...'
                                required
                                id='description'
                                value={state.formData.description}
                                onChange={handleMainFieldChange}
                                className='w-full'
                            />
                        </div>
                        <div>
                            <label htmlFor="slug" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Slug (Auto-generated)</label>
                            <TextInput
                                type='text'
                                placeholder='tutorial-slug'
                                id='slug'
                                value={state.formData.slug}
                                readOnly
                                disabled
                                className='w-full bg-gray-100 dark:bg-gray-700'
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Category</label>
                            <Select id='category' onChange={handleMainFieldChange} value={state.formData.category} className='w-full'>
                                <option value='uncategorized'>Select a category</option>
                                {categoriesLoading ? (
                                    <option disabled>Loading categories...</option>
                                ) : categoriesError ? (
                                    <option disabled>Error loading categories</option>
                                ) : (
                                    availableCategories.map((cat, index) => (
                                        <option key={index} value={cat.toLowerCase().replace(/\s/g, '-')}>{cat}</option>
                                    ))
                                )}
                            </Select>
                        </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div className='flex flex-col gap-3 border-4 border-teal-500 border-dotted p-5 rounded-md relative'>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Tutorial Thumbnail</p>
                        <div className='flex gap-4 items-center justify-between flex-wrap'>
                            <FileInput
                                helperText='Upload a thumbnail image (Max 5MB, JPG, PNG, WEBP, GIF).'
                                type='file'
                                accept='image/*'
                                onChange={handleThumbnailChange}
                                disabled={isUploading}
                                className="flex-1 min-w-[200px]"
                            />
                            {isUploading && (
                                <div className='w-20 h-20 self-center'>
                                    <CircularProgressbar value={uploadProgress} text={`${uploadProgress}%`} strokeWidth={10} styles={{
                                        root: { width: '100%', height: '100%' },
                                        path: { stroke: `rgba(62, 152, 199, ${uploadProgress / 100})` },
                                        text: { fill: '#3b82f6', fontSize: '16px' },
                                    }} />
                                </div>
                            )}
                        </div>
                        {state.formData.thumbnail && !isUploading && (
                            <img src={state.formData.thumbnail} alt='Thumbnail preview' className='w-full h-48 object-cover rounded-md mt-3 border border-gray-300 dark:border-gray-600' />
                        )}
                        {uploadError && <Alert color='failure' className='mt-4'>{uploadError}</Alert>}
                    </div>

                    {/* Chapters Management */}
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Tutorial Chapters</h2>
                    {state.formData.chapters.length === 0 && (
                        <Alert color="info" className="animate-fade-in">
                            <span className="font-semibold">Heads up!</span> No chapters added yet. Click "Add New Chapter" to get started!
                        </Alert>
                    )}
                    {state.formData.chapters
                        .sort((a,b) => a.order - b.order) // Ensure chapters are displayed in order
                        .map((chapter, index) => (
                            <DraggableChapter
                                key={chapter._id || `chapter-${index}`} // Use _id if available, fallback to index
                                chapter={chapter}
                                index={index}
                                totalChapters={state.formData.chapters.length}
                                dispatch={dispatch}
                                handleChapterFieldChange={handleChapterFieldChange}
                                handleChapterContentChange={handleChapterContentChange}
                                moveChapter={moveChapter}
                            />
                        ))}
                    <Button
                        type="button"
                        gradientDuoTone='cyanToBlue'
                        outline
                        onClick={() => dispatch({ type: 'ADD_CHAPTER_FIELD' })}
                        className="w-fit self-end" // Align to right
                    >
                        <FaPlus className="mr-2" /> Add New Chapter
                    </Button>

                    <Button type='submit' gradientDuoTone='purpleToPink' disabled={state.loading || isUploading} className="mt-8">
                        {state.loading ? (<><Spinner size='sm' /><span className='pl-3'>Publishing...</span></>) : 'Publish Tutorial'}
                    </Button>
                    {state.publishError && <Alert className='mt-5 animate-fade-in' color='failure'>{state.publishError}</Alert>}
                </form>

                {/* Draft Modal */}
                <Modal show={showDraftModal} size="md" onClose={handleDismissDraft} popup>
                    <Modal.Header />
                    <Modal.Body>
                        <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                We found an unsaved tutorial draft. Do you want to restore it?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <Button color="success" onClick={handleRestoreDraft}>Yes, restore it</Button>
                                <Button color="gray" onClick={handleDismissDraft}>No, start fresh</Button>
                            </div>
                        </div >
                    </Modal.Body >
                </Modal >
            </div>
        </DndProvider>
    );
}