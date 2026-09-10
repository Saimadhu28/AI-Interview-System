import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

function Result() {

    const navigate = useNavigate();

    const [result, setResult] =
        useState(null);


    useEffect(() => {

        const storedResult =
            localStorage.getItem("result");

        if (!storedResult) {

            navigate("/dashboard");
            return;

        }

        setResult(
            JSON.parse(storedResult)
        );

    }, [navigate]);


    if (!result) {

        return (
            <div className="loading">
                Loading result...
            </div>
        );

    }


    return (
        <div>

            <Navbar />

            <main className="result-page">

                <div className="score-card">

                    <p>
                        Your Interview Score
                    </p>

                    <h1>
                        {result.totalScore}
                        <span>/100</span>
                    </h1>

                    <p>
                        Your interview has been
                        evaluated successfully.
                    </p>

                </div>


                <div className="question-results">

                    <h2>
                        Question-wise Score
                    </h2>


                    {result.questions.map((q) => (

                        <div
                            className="score-row"
                            key={q.id}
                        >

                            <span>
                                Question {q.id}
                            </span>

                            <strong>
                                {q.score}/10
                            </strong>

                        </div>

                    ))}

                </div>


                <div className="result-actions">

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Start New Interview
                    </button>

                    <Link
                        to="/history"
                        className="secondary-link"
                    >
                        View History
                    </Link>

                </div>

            </main>

        </div>
    );
}

export default Result;