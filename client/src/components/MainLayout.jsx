import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

/**
 * Renders the common layout for the application, including the
 * Header, Footer, and scroll-to-top functionality.
 * The <Outlet /> component renders the active child route.
 */
export default function MainLayout() {
    return (
        <>
            <ScrollToTop />
            <Header />
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
            <Footer />
            <BottomNav />
        </>
    );
}