import ThemeToggle from "./components/ThemeToggle";

export default function App() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#242424] transition-colors duration-500">
            <ThemeToggle />
        </div>
    );
}
