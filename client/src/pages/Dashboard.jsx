import { useEffect, useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import DashSidebar from '../components/DashSidebar';

// Dynamically import components using React.lazy
// This splits the code, so each component is a separate file loaded on demand.
const DashProfile = lazy(() => import('../components/DashProfile'));
const DashPosts = lazy(() => import('../components/DashPosts'));
const DashUsers = lazy(() => import('../components/DashUsers'));
const DashComments = lazy(() => import('../components/DashComments'));
const DashboardComp = lazy(() => import('../components/DashboardComp'));

// Create a map to associate tab names with their components.
// This makes it easy to add or remove tabs without changing the rendering logic.
const componentMap = {
  profile: DashProfile,
  posts: DashPosts,
  users: DashUsers,
  comments: DashComments,
  dash: DashboardComp,
};

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    setTab(tabFromUrl || 'dash'); // Default to 'dash' if no tab is specified
  }, [location.search]);

  // Look up the component to render from our map based on the current tab.
  const ActiveComponent = componentMap[tab];

  return (
      <div className='min-h-screen flex flex-col md:flex-row'>
        <div className='md:w-56'>
          {/* Sidebar is always visible */}
          <DashSidebar />
        </div>

        {/* Main content area */}
        <main className='w-full'>
          {/* Suspense provides a fallback UI (like a spinner) while the lazy component loads */}
          <Suspense
              fallback={
                <div className='flex justify-center items-center min-h-screen w-full'>
                  <Spinner size='xl' />
                </div>
              }
          >
            {/* Render the active component if it exists */}
            {ActiveComponent && <ActiveComponent />}
          </Suspense>
        </main>
      </div>
  );
}