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

        document.body.classList.toggle("dark", darkMode);

        localStorage.setItem("darkMode", darkMode);

    }, [darkMode]);

    useEffect(() => {

        document.body.classList.remove(
            "theme-blue",
            "theme-green",
            "theme-purple",
            "theme-black"
        );

        document.body.classList.add(
            `theme-${themeColor}`
        );

        localStorage.setItem(
            "themeColor",
            themeColor
        );

    }, [themeColor]);

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