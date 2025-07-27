// src/components/Hero.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import ParticlesBackground from './ParticlesBackground';

// Define animation variants for cleaner orchestration
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // Slightly faster staggering for a snappier reveal
        },
    },
};

const itemVariants = {
    hidden: { y: -30, opacity: 0, scale: 0.95 }, // Slightly more pronounced initial state
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring", // Use spring for a bouncier, more natural feel
            stiffness: 120,
            damping: 15,
            duration: 0.6 // Adjust duration with spring settings
        },
    },
};

// Default props for reusability
const defaultSequences = [
    'Welcome to My Blog',
    1500,
    'Sharing Thoughts on Code...',
    1500,
    'And Tutorials for Developers.',
    1500,
    'Explore the World of Tech!', // Added another sequence for variety
    1500,
];

const Hero = ({
                  titleSequences = defaultSequences,
                  subtitle = "Dive into a collection of insightful articles, practical tutorials, and the latest trends in web development and software engineering.", // More engaging subtitle
                  ctaText = "Start Reading Now", // More action-oriented CTA
                  ctaLink = "/search"
              }) => {
    return (
        // Container orchestrates the animation and centers content
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-10 p-4 text-center z-10 overflow-hidden' // Increased gap for more breathing room
        >
            {/* Background overlay for better text readability and depth */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute inset-0 bg-black/15 dark:bg-black/40 z-0 backdrop-blur-[1px]" // Stronger blur
            ></motion.div>

            {/* For performance, consider lazy-loading the ParticlesBackground component */}
            <ParticlesBackground />

            {/* Heading with a gradient for better visual appeal */}
            <motion.div variants={itemVariants} className="z-10">
                <TypeAnimation
                    sequence={titleSequences}
                    wrapper="h1"
                    speed={50}
                    className='text-4xl font-extrabold lg:text-7xl bg-gradient-to-r from-teal-400 via-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg' // Added drop-shadow
                    repeat={Infinity}
                    aria-live="polite"
                />
            </motion.div>

            {/* Subtitle with adjusted styling */}
            <motion.p
                variants={itemVariants}
                className='max-w-3xl text-gray-700 dark:text-gray-300 sm:text-xl leading-relaxed z-10' // Larger text, more relaxed leading
            >
                {subtitle}
            </motion.p>

            {/* Link styled as a prominent Call-to-Action (CTA) button */}
            <motion.div variants={itemVariants} className="z-10">
                <Link
                    to={ctaLink}
                    className='inline-block rounded-full bg-teal-600 px-10 py-4 text-xl font-extrabold text-white shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-offset-2 hover:bg-teal-700' // Enhanced sizing, shadow, focus, and hover
                    as={motion.a}
                    whileHover={{ scale: 1.12, boxShadow: '0 12px 25px rgba(0,0,0,0.35)' }} // Stronger hover effect
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 450, damping: 20 }} // Slightly stiffer spring
                >
                    {ctaText}
                </Link>
            </motion.div>

            {/* Subtle Scroll Down Indicator with enhanced animation */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.0, duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeOut" }}
                className="absolute bottom-8 flex flex-col items-center text-gray-400 dark:text-gray-500 z-10"
            >
                <span className="text-base font-medium mb-1">Explore</span>
                <motion.span
                    animate={{ y: [0, 8, 0] }} // More pronounced bounce
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} // Slower, smoother bounce
                    className="text-3xl text-teal-500" // Highlighted arrow
                >
                    &#8595;
                </motion.span>
            </motion.div>
        </motion.div>
    );
};

// Memoize the component for performance.
export default React.memo(Hero);