import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaHome, FaInfoCircle, FaBook, FaQuestionCircle, FaProjectDiagram } from 'react-icons/fa';
import { HiMenuAlt2 } from 'react-icons/hi';

/**
 * Global navigation sidebar with support for keyboard navigation and
 * persisted open state for better UX. The sidebar is hidden behind a
 * toggle on small screens and visible on desktop.
 */
export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(() => {
        const stored = localStorage.getItem('sidebar-open');
        if (stored !== null) return JSON.parse(stored);
        return window.innerWidth >= 768; // default open on desktop
    });

    useEffect(() => {
        localStorage.setItem('sidebar-open', JSON.stringify(isOpen));
    }, [isOpen]);

    const toggleSidebar = () => setIsOpen((prev) => !prev);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSidebar();
        }
    };

    const navItems = [
        { to: '/', label: 'Home', icon: FaHome },
        { to: '/about', label: 'About', icon: FaInfoCircle },
        { to: '/tutorials', label: 'Tutorials', icon: FaBook },
        { to: '/quizzes', label: 'Quizzes', icon: FaQuestionCircle },
        { to: '/projects', label: 'Projects', icon: FaProjectDiagram },
    ];

    return (
        <>
            <button
                className="fixed top-16 left-4 z-30 rounded-md p-2 bg-sidebar-light text-professional-blue-900 dark:bg-sidebar-dark dark:text-professional-blue-100 md:hidden focus:outline-none focus:ring-2 focus:ring-accent-teal"
                aria-label="Toggle navigation"
                aria-expanded={isOpen}
                aria-controls="main-sidebar"
                onClick={toggleSidebar}
                onKeyDown={handleKeyDown}
            >
                <HiMenuAlt2 className="h-5 w-5" />
            </button>

            <nav
                id="main-sidebar"
                role="navigation"
                className={`sidebar fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <ul className="mt-20 flex flex-col gap-4 p-4" role="menu">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <li key={to} role="none">
                            <NavLink
                                to={to}
                                role="menuitem"
                                tabIndex={0}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-md p-2 text-lg outline-none transition-colors focus:ring-2 focus:ring-accent-teal ${
                                        isActive
                                            ? 'font-semibold text-accent-teal'
                                            : 'text-professional-blue-900 dark:text-professional-blue-100'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" aria-hidden="true" />
                                <span>{label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}
