import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setMessage("");

            const response = await API.post("/login", {
                email,
                password
            });

            if (response.data.token) {

                localStorage.setItem(
                    "token",
                    response.data.token
                );

                navigate("/dashboard");

            } else {

                setMessage(
                    response.data.message
                );
            }

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <h1>AI Interview</h1>

                <p className="auth-subtitle">
                    AI-powered interview practice
                </p>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {message && (
                    <p className="error-message">
                        {message}
                    </p>
                )}

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;