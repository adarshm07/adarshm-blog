import { useState } from "react"
import styles from "../styles/Header.module.scss"

export default function Header() {
    const [open, setOpen] = useState<string>("");
    const toggleMenuOpen = () => {
        if (open === "open") setOpen("")
        else setOpen("open")
    }
    return (
        <nav className={`${styles.navbar} ${open ? styles.open : ""}`}>
            <div className={styles.navbaroverlay} onClick={toggleMenuOpen}></div>

            <button type="button" className={styles.navbarburger} onClick={toggleMenuOpen}>
                <svg viewBox="0 0 100 80" width="40" height="40">
                    <rect width="100" height="12" rx="6"></rect>
                    <rect y="30" width="100" height="12" rx="6"></rect>
                    <rect y="60" width="100" height="12" rx="6"></rect>
                </svg>
            </button>
            <h1 className={styles.navbartitle}>adarsh m</h1>
            <nav className={styles.navbarmenu}>
                <button type="button">Skills</button>
                <button type="button" className="active">Awards</button>
                <button type="button">Projects</button>
            </nav>
        </nav >
    )
}