import ThemeToggle from "./components/ThemeToggle";
import Editor2 from "./components/Editor2";
import Editor from "./components/Editor";
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";

export default function App() {
    return (
        <div className="min-h-screen p-1 bg-white text-black dark:bg-[#242424] dark:text-white transition-colors duration-500">
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className="flex-col items-start justify-start">
                                <Editor />
                            </div>
                        }
                    />
                    <Route path="/2" element={<Editor2 />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}
