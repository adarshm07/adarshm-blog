import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { loggedInUser } from '../store/user';

export default function Navbar() {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);

    return (
        <nav className="navbar navbar-expand-lg" style={{ boxShadow: "3px 3px 0px 0px #f9f9f9" }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center w-100">
                    <Link href="/"><a className="navbar-brand" href="#">adarshm</a></Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="d-none d-lg-block" id="navbarNavAltMarkup">
                        <div className="navbar-nav">
                            <Link href="/"><a className="nav-item nav-link">Work</a></Link>
                            <Link href="/"><a className="nav-item nav-link">Resume</a></Link>
                            <Link href="/"><a className="nav-item nav-link">Blog</a></Link>
                            <Link href="/"><a className="nav-item nav-link">Contact</a></Link>
                            {Object.keys(user?.user).length ? <a className="nav-item nav-link login-cta" onClick={() => dispatch(loggedInUser(""))}>Logout</a> : <Link href="/login"><a className="nav-item nav-link login-cta">Login</a></Link>}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}