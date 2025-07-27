// src/components/ParticlesBackground.jsx
import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useMediaQuery } from 'react-responsive'; // For advanced media query detection

export default function ParticlesBackground() {
    const [init, setInit] = useState(false);
    // Prefer a theme context if available, otherwise fallback to system preference
    // const { theme } = useThemeContext();
    const prefersDarkMode = useMediaQuery({ query: '(prefers-color-scheme: dark)' });
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // Detect mobile for optimization

    // A more robust way to determine current mode, considering potential user overrides
    const currentMode = prefersDarkMode ? 'dark' : 'light';

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options = useMemo(
        () => ({
            background: {
                color: {
                    value: "transparent",
                },
            },
            fpsLimit: isMobile ? 60 : 120, // Lower FPS on mobile for performance
            interactivity: {
                events: {
                    onHover: {
                        enable: !isMobile, // Disable hover effects on mobile for better touch experience
                        mode: "bubble",
                        parallax: {
                            enable: true,
                            force: 60,
                            smooth: 10,
                        },
                    },
                    onClick: {
                        enable: true,
                        mode: "push",
                    },
                    resize: true,
                },
                modes: {
                    bubble: {
                        distance: 250, // Increased distance for a wider effect
                        size: 12,     // Larger max size for bubble effect
                        duration: 2,
                        opacity: 0.8,
                        speed: 3,
                    },
                    push: {
                        quantity: isMobile ? 2 : 4, // Push fewer particles on mobile
                    },
                    repulse: {
                        distance: 120,
                        duration: 0.4,
                    },
                },
            },
            particles: {
                color: {
                    // More distinct color palettes for light and dark modes
                    value: currentMode === 'dark' ? ["#404040", "#606060", "#808080"] : ["#b0b0b0", "#d0d0d0", "#f0f0f0"],
                },
                links: {
                    color: {
                        value: currentMode === 'dark' ? "#505050" : "#c0c0c0",
                    },
                    distance: 200, // Even more spread-out links
                    enable: true,
                    opacity: 0.25, // Even more subtle links
                    width: 0.8,    // Thinner links
                    triangles: {
                        enable: true,
                        color: {
                            value: currentMode === 'dark' ? "#606060" : "#e0e0e0",
                        },
                        opacity: 0.02, // Extremely subtle triangles
                    },
                },
                move: {
                    direction: "none",
                    enable: true,
                    outModes: {
                        default: "bounce",
                    },
                    random: true,
                    speed: 0.6, // Even slower for a truly ambient feel
                    straight: false,
                    attract: {
                        enable: true, // Subtle attraction between particles
                        rotateX: 600,
                        rotateY: 1200,
                    },
                    gravity: {
                        enable: false,
                        acceleration: 1,
                    },
                    vibrate: false,
                    warp: false,
                },
                number: {
                    density: {
                        enable: true,
                        area: 1200, // Larger area for more sparse distribution
                    },
                    value: isMobile ? 30 : 50, // Fewer particles on mobile
                },
                opacity: {
                    value: { min: 0.05, max: 0.4 }, // Even wider and more subtle opacity range
                    animation: {
                        enable: true,
                        speed: 0.6, // Slower opacity animation
                        minimumValue: 0.05,
                        sync: false,
                    },
                },
                shape: {
                    type: ["circle", "triangle"], // Mix shapes for variety
                    options: {
                        polygon: {
                            sides: 5,
                        },
                    },
                },
                size: {
                    value: { min: 0.3, max: 2.5 }, // Smaller overall size for ultimate subtlety
                    animation: {
                        enable: true,
                        speed: 1.2, // Slower size animation
                        minimumValue: 0.3,
                        sync: false,
                    },
                },
                twinkle: {
                    particles: {
                        enable: true,
                        frequency: 0.01, // Even less frequent twinkling for a 'rare sparkle' effect
                        opacity: 1,
                        color: {
                            value: "#FFFFFF",
                        },
                    },
                },
            },
            detectRetina: true,
        }),
        [currentMode, isMobile], // Re-memoize options when theme or mobile state changes
    );

    if (init) {
        return (
            <Particles
                id="tsparticles"
                options={options}
                className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
            />
        );
    }

    return null;
}