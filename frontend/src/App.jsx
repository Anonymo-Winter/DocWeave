import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import EditorPage2 from './pages/EditorPage2.jsx';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/socketContext';
import HomePage from './pages/HomePage';
import MainHomePage from './pages/MainHomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage.jsx';
import ForgetPasswordPage from './pages/ForgotPasswordPage.jsx';
import ThemeToggle from './components/ThemeToggleTool.jsx';
import { BiError } from 'react-icons/bi';
import { useCheckAuthQuery } from './api/userApi';
import DashBoard from './pages/DashBoard.jsx';
import Loader from './components/Loader.jsx';
import NotFoundPage from './pages/Page404.jsx';
import { useSelector } from 'react-redux';
import VersionComponent from './components/VersionComponent.jsx';
import { useEffect } from 'react';

const ErrorComponent = () => (
    <div className='relative min-h-[calc(100vh-3rem)] flex items-center justify-center bg-transparent overflow-hidden px-4'>
        {/* Background Gradient */}
        <div className='absolute inset-0 pointer-events-none'>
            <div
                className='absolute inset-0 opacity-40 dark:opacity-50'
                style={{
                    background:
                        'radial-gradient(circle at center, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.03) 50%, transparent 100%)',
                }}
            />
        </div>

        {/* Error Message */}
        <div className='z-10 text-center max-w-md bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-red-200 dark:border-red-700 rounded-lg p-6 shadow-lg'>
            <div className='flex justify-center mb-4 text-red-500 text-5xl'>
                <BiError />
            </div>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                We're experiencing a connection issue
            </h2>
            <p className='text-gray-700 dark:text-gray-300 mb-4'>
                Our servers are currently unreachable. Please check your internet connection or try again in a few
                minutes.
            </p>
            <button
                onClick={() => window.location.reload()}
                className='mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition'
            >
                Retry
            </button>
        </div>
    </div>
);

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const { data, loading } = useCheckAuthQuery();
    return isAuthenticated ? children : <Navigate to='/login' replace />;
};

const RedirectAuthUser = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    return isAuthenticated ? <Navigate to='/dashboard' replace /> : children;
};

const AuthCheck = ({ children }) => {
    const user = useSelector((state) => state.user.user);
    const { isLoading } = useCheckAuthQuery();

    if (isLoading) return <Loader />;
    if (user) return <Navigate to='/dashboard' replace />;
    return children;
};

export default function App() {
    const { isLoading } = useCheckAuthQuery();

    if (isLoading) return <Loader />;

    return (
        <div className='min-h-screen w-full flex flex-col bg-white text-black dark:bg-[#242424] dark:text-white transition-colors duration-500'>
            <main className='flex flex-1 w-full'>
                <ThemeToggle className='absolute top-1/2 right-4 z-[200]' />
                <div className='w-full relative'>
                    <Routes>
                        <Route path='/' element={<HomePage />} />
                        <Route
                            path='/editor/:editorId'
                            element={
                                <PrivateRoute>
                                    <SocketProvider>
                                        <EditorPage />
                                    </SocketProvider>
                                </PrivateRoute>
                            }
                        />
                        {/* <Route
                            path='/editor2'
                            element={
                                <PrivateRoute>
                                    <SocketProvider>
                                        <EditorPage2 />
                                    </SocketProvider>
                                </PrivateRoute>
                            }
                        /> */}
                        <Route
                            path='/login'
                            element={
                                <RedirectAuthUser>
                                    <LoginPage />
                                </RedirectAuthUser>
                            }
                        />
                        {/* <Route
                            path='/version'
                            element={
                                <SocketProvider>
                                    <VersionComponent />
                                </SocketProvider>
                            }
                        /> */}
                        <Route
                            path='/signup'
                            element={
                                <RedirectAuthUser>
                                    <SignUpPage />
                                </RedirectAuthUser>
                            }
                        />
                        <Route
                            path='/forgot-password'
                            element={
                                <RedirectAuthUser>
                                    <ForgetPasswordPage />
                                </RedirectAuthUser>
                            }
                        />
                        <Route
                            path='/dashboard'
                            element={
                                <PrivateRoute>
                                    <DashBoard />
                                </PrivateRoute>
                            }
                        />
                        <Route path='/user-profile' element={<PrivateRoute>{'User Profile'}</PrivateRoute>} />
                        <Route path='/k' element={<MainHomePage />} />
                        <Route path='*' element={<NotFoundPage />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
