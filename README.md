# AI Interview System 🎯

An AI-powered interview practice platform that generates personalized interview questions from a candidate's resume and evaluates their answers using Google Gemini.

🌐 **Live Demo:** https://saimadhu-ai-interview-2026.netlify.app/

## ✨ Features

- **Resume-Based Questions:** Upload your resume in PDF format to generate personalized interview questions.
- **AI-Powered Interviews:** Uses Google Gemini to generate interview questions based on your resume.
- **Answer Evaluation:** Evaluates interview answers and provides scores and feedback.
- **User Authentication:** Secure registration and login using JWT authentication and bcrypt password hashing.
- **Interview History:** Store and access interview results using MongoDB.
- **Performance Feedback:** Review scores and feedback to identify areas for improvement.
- **Email Reports:** Supports sending interview evaluation reports through the configured email service.

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML and CSS
- Axios

**Backend**
- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Multer
- Google Gemini API

**Database**
- MongoDB Atlas
- Mongoose

**Deployment**
- Netlify — Frontend
- Render — Backend
- MongoDB Atlas — Database

## 🏗️ Architecture

1. The user registers or logs in to the React application.
2. The user uploads a resume in PDF format.
3. The Express backend processes the resume and sends its contents to Google Gemini.
4. Gemini generates interview questions based on the resume.
5. The user answers the questions through the frontend.
6. The backend evaluates the answers using Gemini and calculates the results.
7. Interview details, scores and feedback are stored in MongoDB Atlas.
8. The user can review their interview performance and feedback.

## 📁 Project Structure

```text
AI-Interview-System/
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── api/
│   │       └── api.js
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🚀 Run Locally

### Prerequisites

- Node.js and npm
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AI-Interview-System
```

Replace the placeholder with your actual GitHub repository URL.

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=8000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Add your email provider credentials or API key if email reports are enabled.

Start the backend:

```bash
npm start
```

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## ☁️ Deployment

- **Frontend:** Deployed on Netlify.
- **Backend:** Deployed on Render.
- **Database:** Hosted on MongoDB Atlas.

The frontend connects to the backend using the `VITE_API_URL` environment variable. Configure environment variables in your hosting dashboards rather than committing secrets to GitHub.

## 🔐 Security

- Passwords should be stored as bcrypt hashes.
- JWT secrets and API keys must be kept private.
- Environment files containing credentials must not be committed.
- CORS should be configured to allow the intended frontend origin.
- Uploaded resumes may contain personal information and should be handled securely.

## 🎯 Project Objective

The goal of this project is to help candidates prepare for technical interviews through personalized questions, automated answer evaluation and actionable feedback.

## 👨‍💻 Author

**Sai Madhu**

GitHub: https://github.com/Saimadhu28

---

If you find this project useful, consider giving the repository a ⭐.
