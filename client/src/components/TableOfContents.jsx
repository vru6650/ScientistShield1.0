// src/components/TableOfContents.jsx
import { useActiveToc } from "../hooks/useActiveToc"; // --- NEW --- Import the custom hook

export default function TableOfContents({ headings }) {
    // --- NEW --- Get the ID of the currently active heading
    const activeId = useActiveToc(headings.map(h => h.id));

    if (!headings || headings.length === 0) {
        return null;
    }

    return (
        <div className="my-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3">Table of Contents</h3>
            <ul className="space-y-2">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        // --- NEW --- Add left padding for h3 to show hierarchy
                        className={`${heading.level === 'h3' ? 'pl-4' : ''}`}
                    >
                        <a
                            href={`#${heading.id}`}
                            // --- NEW --- Dynamically apply active class
                            className={`hover:text-cyan-500 transition-colors duration-200 ${
                                activeId === heading.id
                                    ? 'text-cyan-500 font-bold'
                                    : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}