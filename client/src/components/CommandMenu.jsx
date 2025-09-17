// client/src/components/CommandMenu.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, TextInput } from 'flowbite-react';
import { AiOutlineSearch } from 'react-icons/ai';

const CommandMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const modalRef = useRef(null);

    const quickLinks = [
        { label: 'Profile', path: '/dashboard?tab=profile' },
        { label: 'Create a Post', path: '/create-post' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        navigate(`/search?searchTerm=${searchTerm}`);
        onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <Modal show={isOpen} onClose={onClose} popup size="lg" ref={modalRef}>
            <Modal.Header />
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <TextInput
                        icon={AiOutlineSearch}
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </form>
                <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Quick Links
                    </h3>
                    <ul className="mt-2 space-y-1">
                        {quickLinks.map((link) => (
                            <li key={link.path}>
                                <button
                                    onClick={() => {
                                        navigate(link.path);
                                        onClose();
                                    }}
                                    className="block w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {link.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CommandMenu;