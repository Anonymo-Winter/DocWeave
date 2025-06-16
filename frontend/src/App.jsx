import ThemeToggle from './components/ThemeToggle';
import EditorPage from './pages/EditorPage';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';

export default function App() {
    return (
        <div className='h-screen flex flex-col bg-white text-black dark:bg-[#242424] dark:text-white transition-colors duration-500'>
            <Navbar />
            <main className='flex flex-1 overflow-hidden'>
                <Routes>
                    <Route path='/' element={<EditorPage />} />
                </Routes>
            </main>
        </div>
    );
}
