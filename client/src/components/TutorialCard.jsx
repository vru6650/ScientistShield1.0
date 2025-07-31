// src/components/TutorialCard.jsx
import { Link } from 'react-router-dom';

const TutorialCard = ({ tutorial }) => (
    <Link to={`/tutorials/${tutorial.slug}`} className="block h-full">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col transform hover:-translate-y-1">
            <img
                src={tutorial.thumbnail || 'https://via.placeholder.com/400x250?text=Tutorial+Thumbnail'}
                alt={tutorial.title}
                className="w-full h-48 object-cover object-center transition-transform duration-300 hover:scale-105"
            />
            <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-white mb-2">{tutorial.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-3 flex-grow">{tutorial.description}</p>
                <div className="mt-4">
                    <span className="inline-block px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium uppercase tracking-wide">
                        {tutorial.category}
                    </span>
                </div>
            </div>
        </div>
    </Link>
);

export default TutorialCard; // Make sure it's exported!