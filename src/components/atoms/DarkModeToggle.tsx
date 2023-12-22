import { useEffect, useState } from "react"
import { FaMoon, FaSun } from "react-icons/fa6"

export default function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState<boolean | any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const theme = localStorage.theme;
            theme ? setDarkMode(true) : setDarkMode(false);
        }
    }, [])

    const toggleDarkMode = () => {
        if (typeof window !== 'undefined') {
            if (darkMode) {
                setDarkMode(false)
                localStorage.theme = "light"
            } else {
                setDarkMode(true);
                localStorage.theme = "dark"
            }
        }
    }

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    return (
        <button onClick={toggleDarkMode}>
            {darkMode ? <FaSun style={{ color: "#f6a20e" }} /> : <FaMoon style={{ color: "#f0e824" }} />}
        </button>
    )
}