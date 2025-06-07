import { Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
    const [theme, setTheme] = useState("light");

    const updateHtmlClass = (theme) => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        if (savedTheme) {
            setTheme(savedTheme);
            updateHtmlClass(savedTheme);
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const systemTheme = prefersDark ? "dark" : "light";
            setTheme(systemTheme);
            updateHtmlClass(systemTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        updateHtmlClass(newTheme);
    };

    return (
        <button onClick={toggleTheme} className="bg-black text-white  px-4 py-2 rounded cursor-pointer">
            {theme === "light" ? "🌙" : "🔆"}
        </button>
    );
};

export default ThemeToggle;
