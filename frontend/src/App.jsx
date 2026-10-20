import { Routes, Route, Navigate } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import { SocketProvider } from './context/socketContext';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage.jsx';
import ForgetPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import { useCheckAuthQuery } from './api/userApi';
import DashBoard from './pages/DashBoard.jsx';
import Loader from './components/Loader.jsx';
import NotFoundPage from './pages/Page404.jsx';
import { useSelector } from 'react-redux';
import ErrorMessage from './components/ErrorMessage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import { Analytics } from '@vercel/analytics/react';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    useCheckAuthQuery();
    return isAuthenticated ? children : <Navigate to='/login' replace />;
};

const RedirectAuthUser = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    return isAuthenticated ? <Navigate to='/dashboard' replace /> : children;
};

export default function App() {
    const { isLoading } = useCheckAuthQuery();

    if (isLoading) return <Loader />;

    return (
        <div className='min-h-screen w-full flex flex-col bg-white text-black dark:bg-[#242424] dark:text-white transition-colors duration-500'>
            <main className='flex flex-1 w-full'>
                <div className='w-full relative'>
                    <Routes>
                        <Route path='/' element={<LandingPage />} />
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
                        <Route
                            path='/login'
                            element={
                                <RedirectAuthUser>
                                    <LoginPage />
                                </RedirectAuthUser>
                            }
                        />
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
                            path='/reset-password'
                            element={
                                <RedirectAuthUser>
                                    <ResetPasswordPage />
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
                        <Route path='/error' element={<ErrorMessage />} />
                        <Route path='/user-profile' element={<PrivateRoute>{'User Profile'}</PrivateRoute>} />
                        <Route path='*' element={<NotFoundPage />} />
                    </Routes>
                </div>
            </main>
            <Analytics />
        </div>
    );
}
