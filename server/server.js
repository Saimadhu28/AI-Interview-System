import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import nodemailer from 'nodemailer'
import { GoogleGenAI } from "@google/genai";

dotenv.config();


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

function sendMail(to, sub, msg) {
    transporter.sendMail({
        to: to,
        subject: sub,
        html: msg
    });
}


// create server
const app = express();

// use middlewares
app.use(express.json());
app.use(cors());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    },
})

// create uplaod instance
const upload = multer({ storage });


async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to database");
}
connectDB();



// create user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    credits: {
        type: Number,
        default: 5
    },

    role: {
        type: String,
        default: "user"
    }
}, {
    timestamps: true
});



const userModel = mongoose.model("Users", userSchema);


const InterviewSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    questions: [
        {
            id: Number,
            question: String,
            answer: {
                type: String,
                default: ""
            },
            score: {
                type: Number,
                default: 0
            },
            feedback: {
                type: String,
                default: ""
            }
        }
    ],

    totalScore: {
        type: Number,
        default: 0
    },

    overallFeedback: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["STARTED", "COMPLETED"],
        default: "STARTED"
    }

}, {
    timestamps: true
});

const Interview = mongoose.model("Interview", InterviewSchema);



// verify whether the user is from our server
function verifyUser(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.json({
            message: "Token missing"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userid = decoded;
        next();

    } catch (error) {

        return res.json({
            message: "Invalid Token"
        });

    }

}

//              ROUTES


// Regitser
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await userModel.create({ name, email, password });
        return res.json({
            message: "User Registerd"
        });
    } catch (error) {
        return res.json({
            message: error
        });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.json({ message: "User does not exist" });
        }
        if (user.password !== password) {
            return res.json({ message: "Password not matched" });
        }
        const token = jwt.sign({
            _id: user._id,
            // email: user.email,
            // name: user.name
        }, process.env.JWT_SECRET);
        return res.json(
            { token }
        );
    } catch (error) {
        return res.json({ error });
    }
});

// dashboard access
app.get("/dashboard", verifyUser, async (req, res) => {
    try {
        const user = await userModel.findOne({
    _id: req.userid._id
});
        return res.json({
            user: `Hii ${user.name}`,
            name: user.name,
            credits: user.credits
        });
    }
    catch (error) {
        return res.json({ message: error });
    }
})





app.post("/upload", verifyUser, upload.single("resume"), async (req, res) => {

    try {

        // 1. Find user
        const user = await userModel.findById(req.userid._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 2. Check credits
        if (user.credits <= 0) {
            return res.status(403).json({
                message: "No credits remaining. Please purchase credits."
            });
        }

        // 3. Read uploaded resume
        const pdfBytes = fs.readFileSync(req.file.path);

        // 4. Generate questions
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: pdfBytes.toString("base64"),
                    },
                },
                {
                    text: `
Read this resume carefully.

Generate exactly 10 interview questions based only on this resume.

Return ONLY JSON.

{
   "questions":[
      {
         "id":1,
         "question":"..."
      }
   ]
}
`
                }
            ],
        });

        let response = result.text;

        response = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const questions = JSON.parse(response);

        // 5. Create new interview document
        const interview = await Interview.create({

            userId: user._id,

            questions: questions.questions,

            totalScore: 0,

            overallFeedback: "",

            status: "STARTED"

        });

        // 6. Deduct one credit
        user.credits -= 1;

        await user.save();

        // 7. Return data to frontend
        return res.json({

            success: true,

            interviewId: interview._id,

            creditsRemaining: user.credits,

            questions: interview.questions

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Something went wrong"
        });

    }

});

app.post("/evaluate", verifyUser, async (req, res) => {

    try {

        const { interviewId, answers } = req.body;

      

        if (!interviewId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({
                message: "interviewId and answers are required"
            });
        }

        const user = await userModel.findById(req.userid._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const interviewRecord = await Interview.findOne({
            _id: interviewId,
            userId: user._id
        });

        if (!interviewRecord) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        /*
         * Combine the questions stored in MongoDB
         * with the answers received from frontend/Postman.
         */

        const interview = interviewRecord.questions.map((question) => {

           const userAnswer = answers.find(
                (answer) => answer.id === question.id
            );

            return {
                id: question.id,
                question: question.question,
                answer: userAnswer ? userAnswer.answer : ""
            };

        });


        let prompt = `You are an experienced technical interviewer.

Evaluate every question and answer carefully.

Scoring Rules:
- There are exactly 10 interview questions.
- Each question carries a maximum of 10 marks.
- Assign an integer score between 0 and 10 for each answer.
- 0 = Completely incorrect or no answer.
- 5 = Partially correct with limited explanation.
- 10 = Excellent, accurate, and well-explained answer.
- Be strict but fair and consistent.

The total score must be the sum of all individual question scores.

Maximum Total Score = 100.

Return ONLY valid JSON.

Format:

{
  "questions":[
    {
      "id":1,
      "score":0,
      "feedback":""
    }
  ],
  "totalScore":0,
  "overallFeedback":""
}

`;


        interview.forEach((q) => {

            prompt += `

Question ${q.id}
${q.question}

Answer
${q.answer}

`;

        });


        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });


        let response = result.text;

        response = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();


        const evaluation = JSON.parse(response);


        const interviewResult = interview.map((item, index) => ({

            id: item.id,

            question: item.question,

            answer: item.answer,

            score: evaluation.questions[index].score,

            feedback: evaluation.questions[index].feedback

        }));


        let mailMessage = `
<h2>Hello ${user.name},</h2>

<p>Thank you for attending the AI Interview.</p>

<h3>Overall Score: ${evaluation.totalScore}/100</h3>

<h3>Question-wise Feedback</h3>
`;


        evaluation.questions.forEach((q, index) => {

            mailMessage += `
        <hr>

        <h4>Question ${q.id}</h4>

        <p><b>Question:</b></p>
        <p>${interview[index].question}</p>

        <p><b>Your Answer:</b></p>
        <p>${interview[index].answer}</p>

        <p><b>Score:</b> ${q.score}/10</p>

        <p><b>Feedback:</b></p>
        <p>${q.feedback}</p>
    `;

        });


        mailMessage += `

<hr>

<h3>Overall Feedback</h3>

<p>${evaluation.overallFeedback}</p>

<br>

<p>Thank you for using the AI Interview System.</p>
`;


        sendMail(
            user.email,
            "AI Interview Evaluation Report",
            mailMessage
        );


        /*
         * Update the existing interview document
         */

        interviewRecord.questions = interviewResult;

        interviewRecord.totalScore = evaluation.totalScore;

        interviewRecord.overallFeedback =
            evaluation.overallFeedback;

        interviewRecord.status = "COMPLETED";


        await interviewRecord.save();


        const responseData = {

            success: true,

            interviewId: interviewId,

            questions: evaluation.questions.map((q) => ({

                id: q.id,

                score: q.score,

                feedback: q.feedback

            })),

            totalScore: evaluation.totalScore,

            overallFeedback: evaluation.overallFeedback

        };


        return res.json(responseData);


    } catch (error) {

        console.error("Evaluation Error:", error);

        return res.status(500).json({
            message: "Error evaluating interview",
            error: error.message
        });

    }

});


app.get("/history", verifyUser, async (req, res) => {

    try {

        const interviews = await Interview.find({
            userId: req.userid._id
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            interviews
        });

    } catch (error) {

        return res.status(500).json({
            message: "Failed to fetch interview history"
        });

    }

});





// start the server
app.listen(process.env.PORT, () => {
    console.log("Server started");
})
