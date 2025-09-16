import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';

export default function MainLayout() {
    // Pinned state is saved so the user's choice persists
    const [isPinned, setIsPinned] = useState(() =>
        JSON.parse(localStorage.getItem('sidebar-pinned')) || false
    );
    // Hover state is temporary for auto-hiding
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        localStorage.setItem('sidebar-pinned', JSON.stringify(isPinned));
    }, [isPinned]);

    // The sidebar is collapsed only if it's NOT pinned and the user is NOT hovering
    const isSidebarCollapsed = !isPinned && !isHovering;

    return (
        <>
            <ScrollToTop />
            <Header />
            <div className="flex">
                <div
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className="relative z-40"
                >
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        isPinned={isPinned}
                        setIsPinned={setIsPinned}
                    />
                </div>
                <main className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                    <Outlet />
                </main>
            </div>
            <Footer />
            <BottomNav />
        </>
    );
}