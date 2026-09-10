import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../api/api";

function Interview() {

    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);

    const [answers, setAnswers] = useState({});

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");


    // Get questions from localStorage
    useEffect(() => {

        const storedQuestions =
            localStorage.getItem("interviewQuestions");

        if (!storedQuestions) {
            navigate("/dashboard");
            return;
        }

        setQuestions(JSON.parse(storedQuestions));

    }, [navigate]);


    if (questions.length === 0) {

        return (
            <div className="loading">
                Loading interview...
            </div>
        );

    }


    const question = questions[currentQuestion];


    // =========================
    // HANDLE ANSWER
    // =========================

    const handleAnswerChange = (e) => {

        const value = e.target.value;

        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [question.id]: value
        }));

    };


    // =========================
    // NEXT QUESTION
    // =========================

    const nextQuestion = () => {

        if (currentQuestion < questions.length - 1) {

            setCurrentQuestion(
                currentQuestion + 1
            );

        }

    };


    // =========================
    // PREVIOUS QUESTION
    // =========================

    const previousQuestion = () => {

        if (currentQuestion > 0) {

            setCurrentQuestion(
                currentQuestion - 1
            );

        }

    };


    // =========================
    // SUBMIT INTERVIEW
    // =========================

    const submitInterview = async () => {

        try {

            setLoading(true);
            setMessage("");

            const interviewId =
                localStorage.getItem("interviewId");


            // Create answers array
            const answerData = questions.map((q) => ({

                id: q.id,

                question: q.question,

                answer: answers[q.id] || ""

            }));


            // VERY IMPORTANT
            console.log("Interview ID:", interviewId);

            console.log(
                "Answers being sent:",
                answerData
            );


            // Send to backend
            const response = await API.post(
                "/evaluate",
                {
                    interviewId: interviewId,
                    answers: answerData
                }
            );


            console.log(
                "Evaluation response:",
                response.data
            );


            // Save result
            localStorage.setItem(
                "result",
                JSON.stringify(response.data)
            );


            navigate("/result");


        } catch (error) {

            console.log(
                "Evaluation Error:",
                error
            );

            console.log(
                "Backend Error:",
                error.response?.data
            );

            setMessage(
                error.response?.data?.message ||
                "Evaluation failed."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // PROGRESS
    // =========================

    const progress =
        ((currentQuestion + 1) /
            questions.length) * 100;


    return (

        <div>

            <Navbar />

            <main className="interview-page">


                {/* TOP */}

                <div className="interview-top">

                    <span>
                        Question {currentQuestion + 1}
                        {" "}of{" "}
                        {questions.length}
                    </span>

                    <span>
                        {Math.round(progress)}%
                    </span>

                </div>


                {/* PROGRESS BAR */}

                <div className="progress-bar">

                    <div
                        style={{
                            width: `${progress}%`
                        }}
                    />

                </div>


                {/* QUESTION */}

                <div className="question-card">

                    <p className="question-label">

                        Question {question.id}

                    </p>


                    <h2>

                        {question.question}

                    </h2>


                    {/* ANSWER */}

                    <textarea

                        placeholder="Type your answer here..."

                        value={
                            answers[question.id] || ""
                        }

                        onChange={
                            handleAnswerChange
                        }

                    />


                    {message && (

                        <p className="error-message">
                            {message}
                        </p>

                    )}


                    {/* BUTTONS */}

                    <div className="question-actions">


                        <button

                            className="secondary-btn"

                            onClick={
                                previousQuestion
                            }

                            disabled={
                                currentQuestion === 0
                            }

                        >

                            Previous

                        </button>


                        {currentQuestion <
                        questions.length - 1 ? (

                            <button
                                onClick={nextQuestion}
                            >

                                Next

                            </button>

                        ) : (

                            <button
                                onClick={submitInterview}
                                disabled={loading}
                            >

                                {loading
                                    ? "Evaluating..."
                                    : "Submit Interview"}

                            </button>

                        )}

                    </div>

                </div>

            </main>

        </div>

    );

}

export default Interview;