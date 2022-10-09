import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { loggedInUser } from '../store/user';

export default function Navbar() {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center w-100">
                    <a className="navbar-brand" href="#">adarshm</a>
                    {/* <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button> */}
                    <div className="" id="navbarNavAltMarkup">
                        <div className="navbar-nav">
                            <a className="nav-item nav-link" href="#">Work</a>
                            <a className="nav-item nav-link" href="#">Resume</a>
                            <a className="nav-item nav-link" href="#">Blog</a>
                            <a className="nav-item nav-link" href="#">Contact</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        // <nav className="navbar navbar-expand-lg navbar-light bg-light">
        //     <Link className="navbar-brand" href="/">Navbar</Link>
        //     <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
        //         <span className="navbar-toggler-icon"></span>
        //     </button>
        //     {Object.keys(user?.user).length ? <button className="btn btn-link" onClick={() => dispatch(loggedInUser(""))}>Logout</button> : <Link href="/login" className="btn btn-primary">Login</Link>}
        // </nav>
    )
}