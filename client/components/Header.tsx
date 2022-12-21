import { useState } from "react"
import styles from "../styles/Header.module.scss"
import axios from "axios";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { loggedInUser } from '../store/user';
import { apiDomain } from "../config/mediaUrls";

export default function Header() {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);

    const logout = () => {
        dispatch(loggedInUser(""));
        axios.get(`${apiDomain}/auth/logout`)
            .then((res) => console.log('logged out.'))
            .catch((err) => console.log('error'))
    }

    const [open, setOpen] = useState<boolean>(false);
    const toggleMenuOpen = () => {
        if (open) setOpen(false)
        else setOpen(true)
    }
    return (
        <nav className={`${styles.navbar} ${open ? styles.open : ""}`}>
            <div className="container">
                <div className={styles.navbaroverlay} onClick={toggleMenuOpen}></div>

                <button type="button" className={styles.navbarburger} onClick={toggleMenuOpen}>
                    {!open ? <i className={styles['gg-menu-left']}></i> : <i className={styles['gg-close']}></i>}
                </button>
                <div className="d-flex justify-content-center justify-content-md-between align-items-center">
                    <Link href="/"><h1 className={styles.navbartitle}>adarsh m</h1></Link>
                    <nav className={styles.navbarmenu}>
                        <Link href="/"><a className={`${styles['nav-item']} ${styles['nav-link']}`}>Work</a></Link>
                        <Link href="/blog"><a className={`${styles['nav-item']} ${styles['nav-link']}`}>Blog</a></Link>
                        <Link href="/"><a className={`${styles['nav-item']} ${styles['nav-link']}`}>Contact</a></Link>
                        {Object.keys(user?.user).length ? <Link href="/"><a className={`${styles['nav-item']} ${styles['nav-link']} ${styles['login-cta']}`} onClick={logout}>Logout</a></Link> : <Link href="/login"><a className={`${styles['nav-item']} ${styles['nav-link']} ${styles['login-cta']}`}>Login</a></Link>}
                    </nav>
                </div>
            </div>
        </nav >
    )
}