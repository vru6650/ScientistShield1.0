import { Button, TextInput, Select, Textarea } from 'flowbite-react';
import TiptapEditor from './TiptapEditor'; // Assuming TiptapEditor is in the same directory or adjust path
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FaTrash, FaCode, FaQuestionCircle } from 'react-icons/fa';

const ItemTypes = {
    CHAPTER: 'chapter',
};

const DraggableChapter = ({ chapter, index, dispatch, handleChapterFieldChange, handleChapterContentChange, moveChapter, quizzesData, quizzesLoading, quizzesError }) => {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CHAPTER,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemTypes.CHAPTER,
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) {
                return;
            }

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            moveChapter(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    const opacity = isDragging ? 0.5 : 1;
    const availableQuizzes = quizzesData || [];

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
                    className="w-full bg-gray-100 dark:bg-gray-700"
                />
            </div>

            <div className="mb-4">
                <label htmlFor={`contentType-${index}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Content Type</label>
                <Select
                    id={`contentType-${index}`}
                    value={chapter.contentType}
                    onChange={(e) => {
                        handleChapterFieldChange(index, 'contentType', e.target.value);
                        if (e.target.value === 'text') {
                            handleChapterFieldChange(index, 'initialCode', '');
                            handleChapterFieldChange(index, 'expectedOutput', '');
                            handleChapterFieldChange(index, 'quizId', '');
                        } else if (e.target.value === 'code-interactive') {
                            handleChapterFieldChange(index, 'quizId', '');
                        } else if (e.target.value === 'quiz') {
                            handleChapterContentChange(index, '');
                            handleChapterFieldChange(index, 'initialCode', '');
                            handleChapterFieldChange(index, 'expectedOutput', '');
                        }
                    }}
                >
                    <option value="text">Text Content</option>
                    <option value="code-interactive">Interactive Code Example</option>
                    <option value="quiz">Linked Quiz</option>
                </Select>
            </div>

            {chapter.contentType === 'code-interactive' && (
                <div className="mb-4">
                    <label htmlFor={`initialCode-${index}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-1"><FaCode /> Initial Code</label>
                    <Textarea
                        id={`initialCode-${index}`}
                        placeholder='Write the initial code for the interactive example (e.g., console.log("Hello")). This will appear in the editor.'
                        value={chapter.initialCode}
                        onChange={(e) => handleChapterFieldChange(index, 'initialCode', e.target.value)}
                        rows={6}
                        className="min-h-[100px]"
                    />
                    <label htmlFor={`expectedOutput-${index}`} className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Expected Output (Optional)</label>
                    <Textarea
                        id={`expectedOutput-${index}`}
                        placeholder='Enter the exact expected output for automated testing/validation (e.g., "Hello" if console.log("Hello")).'
                        value={chapter.expectedOutput}
                        onChange={(e) => handleChapterFieldChange(index, 'expectedOutput', e.target.value)}
                        rows={3}
                        className="min-h-[60px]"
                    />
                </div>
            )}

            {chapter.contentType === 'quiz' && (
                <div className="mb-4">
                    <label htmlFor={`quizId-${index}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-1"><FaQuestionCircle /> Link Quiz</label>
                    <Select
                        id={`quizId-${index}`}
                        value={chapter.quizId || ''}
                        onChange={(e) => handleChapterFieldChange(index, 'quizId', e.target.value)}
                        disabled={quizzesLoading || quizzesError}
                    >
                        <option value="">Select a Quiz</option>
                        {quizzesLoading ? (
                            <option disabled>Loading quizzes...</option>
                        ) : quizzesError ? (
                            <option disabled>Error loading quizzes</option>
                        ) : (
                            availableQuizzes.map(quiz => (
                                <option key={quiz._id} value={quiz._id}>{quiz.title}</option>
                            ))
                        )}
                    </Select>
                    {quizzesError && <p className="text-red-500 text-sm mt-1">Failed to load quizzes.</p>}
                </div>
            )}

            {(chapter.contentType === 'text' || chapter.contentType === 'code-interactive') && (
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {chapter.contentType === 'text' ? 'Chapter Content' : 'Description for Interactive Code (Optional)'}
                    </label>
                    <TiptapEditor
                        content={chapter.content}
                        onChange={(newContent) => handleChapterContentChange(index, newContent)}
                        placeholder={chapter.contentType === 'text' ? `Write content for Chapter ${chapter.order}...` : `Add a description or instructions for the interactive code example in Chapter ${chapter.order}...`}
                    />
                </div>
            )}
        </div>
    );
};

export default DraggableChapter;