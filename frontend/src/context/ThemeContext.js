import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("darkMode") === "true"
    );

    const [themeColor, setThemeColor] = useState(
        () => localStorage.getItem("themeColor") || "blue"
    );

    useEffect(() => {
        localStorage.setItem("darkMode", darkMode);
        localStorage.setItem("themeColor", themeColor);
        if (darkMode) {
            document.documentElement.setAttribute(
                "data-theme",
                "dark"
            );
        } else {
            document.documentElement.removeAttribute(
                "data-theme"
            );
        }
        const colors = {blue: "#2563eb", green: "#16a34a", purple: "#7c3aed", black: "#111827"};
        document.documentElement.style.setProperty(
            "--primary",
            colors[themeColor]
        );
    }, [darkMode, themeColor]);

    return (
        <ThemeContext.Provider
            value={{
                darkMode,
                setDarkMode,
                themeColor,
                setThemeColor
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);