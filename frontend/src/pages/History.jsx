import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import API from "../api/api";

function History() {

    const [interviews, setInterviews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");


    useEffect(() => {

        const getHistory = async () => {

            try {

                const response =
                    await API.get("/history");

                setInterviews(
                    response.data.interviews
                );

            } catch (error) {

                setMessage(
                    "Failed to load interview history."
                );

            } finally {

                setLoading(false);

            }

        };

        getHistory();

    }, []);


    if (loading) {

        return (
            <div className="loading">
                Loading history...
            </div>
        );

    }


    return (
        <div>

            <Navbar />

            <main className="history-page">

                <h1>
                    Interview History
                </h1>

                <p className="history-subtitle">
                    Review your previous interviews
                </p>


                {message && (

                    <p className="error-message">
                        {message}
                    </p>

                )}


                {interviews.length === 0 ? (

                    <div className="empty-history">

                        <h2>
                            No interviews yet
                        </h2>

                        <p>
                            Start your first AI interview
                            from the dashboard.
                        </p>

                    </div>

                ) : (

                    <div className="history-list">

                        {interviews.map((interview) => (

                            <div
                                className="history-card"
                                key={interview._id}
                            >

                                <div>

                                    <h3>
                                        AI Interview
                                    </h3>

                                    <p>
                                        {new Date(
                                            interview.createdAt
                                        ).toLocaleString()}
                                    </p>

                                    <span
                                        className={
                                            interview.status ===
                                            "COMPLETED"
                                                ? "status-completed"
                                                : "status-started"
                                        }
                                    >
                                        {interview.status}
                                    </span>

                                </div>


                                <div className="history-score">

                                    <span>
                                        Score
                                    </span>

                                    <strong>
                                        {interview.totalScore}
                                        /100
                                    </strong>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>

        </div>
    );
}

export default History;