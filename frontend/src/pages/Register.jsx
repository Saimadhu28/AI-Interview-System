import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setMessage("");

            const response = await API.post("/register", {
                name,
                email,
                password
            });

            if (response.data.message) {

                navigate("/");

            }

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <h1>Create Account</h1>

                <p className="auth-subtitle">
                    Start with 5 free interview credits
                </p>

                <form onSubmit={handleRegister}>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />

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
                        {loading
                            ? "Creating..."
                            : "Create Account"}
                    </button>

                </form>

                {message && (
                    <p className="error-message">
                        {message}
                    </p>
                )}

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/">
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Register;