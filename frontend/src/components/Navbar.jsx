import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <nav className="navbar">

            <Link to="/dashboard" className="logo">
                AI Interview
            </Link>

            <div className="nav-links">

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/history">
                    History
                </Link>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;