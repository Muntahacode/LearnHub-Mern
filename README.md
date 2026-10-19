# LearnHub – MERN Stack Learning Management System

## Project Overview
LearnHub is a Learning Management System built using the MERN stack. Users can browse courses, view course details, register for an account, and log in.

## Features
- Home page
- Course listing
- Course details
- User registration
- User login
- Password hashing using bcrypt
- JWT authentication
- MongoDB database integration
- REST API using Express.js

## Technologies Used
- MongoDB Atlas
- Express.js
- React.js
- Node.js
- Axios
- React Router
- bcryptjs
- JSON Web Token (JWT)

## Project Structure
- `frontend/` – React frontend application
- `backend/` – Node.js and Express.js backend API
- `README.md` – Project documentation

## Installation and Setup

### Backend Setup
1. Open a terminal in the `backend` folder.
2. Run `npm install`.
3. Create a `.env` file using your own MongoDB connection string and JWT secret.
4. Start the backend using `node server.js`.

### Frontend Setup
1. Open another terminal in the `frontend` folder.
2. Run `npm install`.
3. Start the frontend using `npm start`.
4. Open `http://localhost:3000` in your browser.

## API Endpoints
- `GET /api/courses` – Retrieve all courses.
- `GET /api/courses/:id` – Retrieve a course by ID.
- Authentication routes are available under `/api/auth`.

## Database
MongoDB Atlas is used to store course and user information.

## Testing Evidence
Screenshots of the running application, registration/login, course pages, and API responses are included in the project report.

## Deployment
Live deployment link: Not deployed yet.

## Author
LearnHub MERN Stack Project
