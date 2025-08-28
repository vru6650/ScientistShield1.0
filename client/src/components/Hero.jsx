// client/src/components/Hero.jsx

import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import { useState } from 'react';

import { TypeAnimation } from 'react-type-animation';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import ParticlesBackground from './ParticlesBackground';

export default function Hero() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim() !== '') {
            params.set('searchTerm', searchQuery.trim());
        }
        navigate(`/tutorials?${params.toString()}`);
    };

    return (
        <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 text-center min-h-[500px] flex items-center justify-center">
            {/* Animated particle background for a more dynamic hero section */}
            <ParticlesBackground />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-extrabold mb-4 sm:mb-6 leading-tight animate-fade-in-up text-[var(--color-text-primary)]">
                    <TypeAnimation
                        sequence={[
                            'Level Up Your Coding Skills',
                            2000,
                            'Master Web Development',
                            2000,
                            'Build Amazing Projects',
                            2000,
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                    />
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-0 animate-fade-in delay-500 text-[var(--color-text-secondary)]">
                    Explore thousands of tutorials, articles, and projects to become a better developer.
                </p>
                <form
                    onSubmit={handleSearch}
                    className="flex max-w-xl mx-auto rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02] mt-8"
                >
                    <TextInput
                        type="text"
                        placeholder="Search for tutorials..."
                        className="flex-grow rounded-l-full [&>div>input]:!rounded-none [&>div>input]:!border-0 [&>div>input]:!ring-0 [&>div>input]:!shadow-none [&>div>input]:bg-white/90 [&>div>input]:placeholder-gray-500 [&>div>input]:text-gray-900 focus:!ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={HiMagnifyingGlass}
                    />
                    <Button
                        type="submit"
                        className="bg-sky-500 hover:bg-sky-600 text-white !rounded-none rounded-r-full h-11 w-20 transition-colors duration-300 transform hover:scale-105"
                    >
                        Go
                    </Button>
                </form>
            </div>
        </section>
    );
}
