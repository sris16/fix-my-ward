import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Read initial theme from localStorage, default to 'dark'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("fmw-theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    // Persist to localStorage
    localStorage.setItem("fmw-theme", theme);

    // Add theme-transition helper to document element
    const timeout = setTimeout(() => {
      root.classList.add("theme-transition");
    }, 100);

    return () => clearTimeout(timeout);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};
