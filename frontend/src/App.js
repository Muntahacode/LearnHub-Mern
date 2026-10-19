import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import "./App.css";

const API = "http://localhost:5000/api";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">LearnHub</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/login">Login</Link>
        <Link to="/register" className="nav-button">Register</Link>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">WELCOME TO LEARNHUB</p>
      <h1>Learn New Skills.<br />Build Your Future.</h1>
      <p className="hero-text">
        Discover courses, learn from instructors, and take the next step
        toward your goals.
      </p>
      <Link to="/courses" className="primary-button">Explore Courses</Link>
    </section>
  );
}

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/courses`)
      .then((response) => setCourses(response.data))
      .catch(() => setError("Courses could not load. Check your backend and database connection."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <h1>Explore Courses</h1>
      <p className="muted">Find a course to start learning something new.</p>

      {loading && <p>Loading courses...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <p>No courses available yet. Please check back soon.</p>
      )}

      <div className="course-grid">
        {courses.map((course) => (
          <article className="course-card" key={course._id}>
            <div className="course-icon">📘</div>
            <p className="category">{course.category}</p>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <p className="price">
              {Number(course.price) === 0 ? "Free" : `$${course.price}`}
            </p>
            <Link to={`/courses/${course._id}`} className="primary-button">
              View Details
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/courses/${id}`)
      .then((response) => setCourse(response.data))
      .catch(() => setError("Course not found or backend unavailable."));
  }, [id]);

  if (error) return <main className="page"><p className="error">{error}</p><Link to="/courses">Back to Courses</Link></main>;
  if (!course) return <main className="page"><p>Loading course...</p></main>;

  return (
    <main className="page detail-card">
      <p className="category">{course.category}</p>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p><strong>Instructor:</strong> {course.instructor?.name || "LearnHub Instructor"}</p>
      <p><strong>Price:</strong> {Number(course.price) === 0 ? "Free" : `$${course.price}`}</p>
      <Link to="/register" className="primary-button">Register to Get Started</Link>
    </main>
  );
}

function AuthForm({ isRegister }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const response = await axios.post(`${API}${endpoint}`, form);

      if (response.data.token) {
        localStorage.setItem("learnhubToken", response.data.token);
        localStorage.setItem("learnhubUser", JSON.stringify(response.data.user));
      }

      setMessage(response.data.message || "Success!");

      if (!isRegister) {
        setTimeout(() => navigate("/courses"), 700);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Request failed. Check the backend and database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{isRegister ? "Create Account" : "Welcome Back"}</h1>
        <p className="muted">
          {isRegister ? "Join the LearnHub learning community." : "Log in to your LearnHub account."}
        </p>

        {isRegister && (
          <>
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
          </>
        )}

        <label>Email Address</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" minLength={6} required />

        {isRegister && (
          <>
            <label>Account Type</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button className="primary-button full-button" type="submit" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
        </button>

        <p className="auth-switch">
          {isRegister ? "Already have an account? " : "New to LearnHub? "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </form>
    </main>
  );
}

function NotFound() {
  return (
    <main className="page">
      <h1>Page not found</h1>
      <Link to="/" className="primary-button">Go Home</Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login" element={<AuthForm isRegister={false} />} />
        <Route path="/register" element={<AuthForm isRegister={true} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}