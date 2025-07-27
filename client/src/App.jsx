import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Spinner } from 'flowbite-react';
// In your main.jsx or App.jsx
import 'highlight.js/styles/atom-one-dark.css';

// Import layout and route protection components statically
import MainLayout from './components/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute';

// 1. LAZY LOAD all page components for code-splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const UpdatePost = lazy(() => import('./pages/UpdatePost'));
const PostPage = lazy(() => import('./pages/PostPage'));
const Search = lazy(() => import('./pages/Search'));
const NotFound = lazy(() => import('./pages/NotFound'));

// A fallback component to show while pages are loading
const LoadingFallback = () => (
    <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
    </div>
);

export default function App() {
    return (
        <BrowserRouter>
            {/* 2. Wrap Routes in Suspense to handle loading states */}
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* 3. All pages with Header/Footer are nested under MainLayout */}
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="search" element={<Search />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="post/:postSlug" element={<PostPage />} />

                        {/* Private Routes also use the main layout */}
                        <Route element={<PrivateRoute />}>
                            <Route path="dashboard" element={<Dashboard />} />
                        </Route>

                        {/* Admin Routes also use the main layout */}
                        <Route element={<OnlyAdminPrivateRoute />}>
                            <Route path="create-post" element={<CreatePost />} />
                            <Route path="update-post/:postId" element={<UpdatePost />} />
                        </Route>

                        {/* 4. The Not Found route also gets the layout */}
                        <Route path="*" element={<NotFound />} />
                    </Route>

                    {/* Routes without the MainLayout can be defined here */}
                    {/* For example, if SignIn/SignUp had a different, minimal layout */}
                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/sign-up" element={<SignUp />} />

                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}