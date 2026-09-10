import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../api/api";

function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {

        const getDashboard = async () => {

            try {

                const response =
                    await API.get("/dashboard");

                setUser(response.data);

            } catch (error) {

                localStorage.removeItem("token");
                navigate("/");

            }

        };

        getDashboard();

    }, [navigate]);


    const handleFileChange = (e) => {

        const selectedFile = e.target.files[0];

        if (!selectedFile) {
            return;
        }

        if (selectedFile.type !== "application/pdf") {

            setMessage(
                "Please select a PDF file."
            );

            setFile(null);
            return;
        }

        setFile(selectedFile);
        setMessage("");

    };


    const startInterview = async () => {

        if (!file) {

            setMessage(
                "Please select your resume first."
            );

            return;
        }

        if (user.credits <= 0) {

            setMessage(
                "No credits remaining. Please purchase credits."
            );

            return;
        }

        const formData = new FormData();

        formData.append("resume", file);

        try {

            setLoading(true);
            setMessage("");

            const response =
                await API.post(
                    "/upload",
                    formData
                );

            localStorage.setItem(
                "interviewId",
                response.data.interviewId
            );

            localStorage.setItem(
                "interviewQuestions",
                JSON.stringify(
                    response.data.questions
                )
            );

            localStorage.setItem(
                "credits",
                response.data.creditsRemaining
            );

            navigate("/interview");

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to generate interview."
            );

        } finally {

            setLoading(false);

        }
    };


    if (!user) {

        return (
            <div className="loading">
                Loading...
            </div>
        );

    }


    return (
        <div>

            <Navbar />

            <main className="dashboard">

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Welcome, {user.name}
                        </h1>

                        <p>
                            Get ready for your next
                            AI-powered interview.
                        </p>

                    </div>

                    <div className="credits-card">

                        <span>
                            Available Credits
                        </span>

                        <strong>
                            {user.credits}
                        </strong>

                    </div>

                </div>


                <div className="upload-card">

                    <h2>
                        Start a New Interview
                    </h2>

                    <p>
                        Upload your resume and
                        Gemini will generate 10
                        interview questions based
                        on your resume.
                    </p>


                    <label className="file-label">

                        Select Resume

                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                        />

                    </label>


                    {file && (

                        <p className="selected-file">
                            Selected: {file.name}
                        </p>

                    )}


                    <button
                        onClick={startInterview}
                        disabled={
                            loading ||
                            user.credits <= 0
                        }
                    >

                        {loading
                            ? "Generating Questions..."
                            : "Start Interview"}

                    </button>


                    {user.credits <= 0 && (

                        <p className="warning-message">
                            You have used all your
                            interview credits.
                        </p>

                    )}


                    {message && (

                        <p className="error-message">
                            {message}
                        </p>

                    )}

                </div>


                <div className="feature-grid">

                    <div className="feature-card">

                        <h3>
                            Resume Based
                        </h3>

                        <p>
                            Questions are generated
                            specifically from your resume.
                        </p>

                    </div>


                    <div className="feature-card">

                        <h3>
                            AI Evaluation
                        </h3>

                        <p>
                            Get a score and feedback
                            for every answer.
                        </p>

                    </div>


                    <div className="feature-card">

                        <h3>
                            Interview History
                        </h3>

                        <p>
                            Keep track of your
                            previous interview results.
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;