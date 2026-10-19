
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("learnhubToken");
}

function Home() {
  return (
    <main className="page">
      <section className="hero">
        <h1>Welcome to LearnHub</h1>
        <p>Learn new skills. Build your future.</p>
        <Link className="btn" to="/courses">Explore Courses</Link>
      </section>
      <h2>Why LearnHub?</h2>
      <div className="course-grid">
        <article className="course-card">
          <h3>Expert Courses</h3>
          <p>Explore courses designed to help you grow.</p>
        </article>
        <article className="course-card">
          <h3>Learn Anywhere</h3>
          <p>Access your learning journey online.</p>
        </article>
        <article className="course-card">
          <h3>Track Progress</h3>
          <p>Keep track of your enrolled courses.</p>
        </article>
      </div>
    </main>
  );
}

function Courses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/courses`)
      .then((res) => {
        const data = res.data;
        setCourses(Array.isArray(data) ? data : data.courses || []);
      })
      .catch(() => setError("Courses load nahi huay. Backend check karo."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <h1>Available Courses</h1>
      {loading && <p>Loading courses...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && courses.length === 0 && (
        <p>Abhi koi course available nahi hai.</p>
      )}
      <div className="course-grid">
        {courses.map((course) => (
          <article className="course-card" key={course._id}>
            <p className="category">{course.category}</p>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <p>Price: {course.price ?? "Free"}</p>
            <Link className="btn" to={`/courses/${course._id}`}>
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/courses/${id}`)
      .then((res) => setCourse(res.data.course || res.data))
      .catch(() => setMessage("Course load nahi hua."))
      .finally(() => setLoading(false));
  }, [id]);

  const enroll = async () => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await axios.post(
        `${API}/enroll`,
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Enrollment successful!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Enrollment nahi ho saki.");
    }
  };

  if (loading) return <main className="page">Loading course...</main>;

  return (
    <main className="page">
      {course ? (
        <>
          <h1>{course.title}</h1>
          <p className="category">{course.category}</p>
          <p>{course.description}</p>
          <p>Price: {course.price ?? "Free"}</p>
          <button className="btn" onClick={enroll}>Enroll Now</button>
        </>
      ) : <h1>Course not found</h1>}
      {message && <p>{message}</p>}
    </main>
  );
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      const token = res.data.token || res.data.accessToken;
      if (token) localStorage.setItem("learnhubToken", token);
      if (res.data.user) {
        localStorage.setItem("learnhubUser", JSON.stringify(res.data.user));
      }
      setMessage("Login successful!");
      navigate("/courses");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed. Details check karo.");
    }
  };

  return (
    <main className="page auth-page">
      <h1>Login</h1>
      <form onSubmit={submit} className="auth-form">
        <input type="email" placeholder="Email" required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn" type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </main>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "student"
  });
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/register`, form);
      setMessage("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <main className="page auth-page">
      <h1>Create Account</h1>
      <form onSubmit={submit} className="auth-form">
        <input placeholder="Full Name" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" placeholder="Email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password (minimum 6 characters)"
          minLength="6" required value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
        <button className="btn" type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
      <p>Already registered? <Link to="/login">Login</Link></p>
    </main>
  );
}

function MyCourses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState("Loading your courses...");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get(`${API}/my-courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data.enrollments;
        if (Array.isArray(list)) {
          setEnrollments(list);
          setMessage("");
        } else {
          setMessage("Backend ne courses ki list nahi bheji.");
        }
      })
      .catch((err) => setMessage(
        err.response?.data?.message || "Courses load nahi huay."
      ));
  }, [navigate]);

  return (
    <main className="page">
      <h1>My Courses</h1>
      {message && <p>{message}</p>}
      {!message && enrollments.length === 0 && <p>Abhi enrolled courses nahi hain.</p>}
      <div className="course-grid">
        {enrollments.map((item) => (
          <article className="course-card" key={item._id}>
            <h2>{item.course?.title || item.title || "Course"}</h2>
            <p>{item.course?.description || item.description}</p>
            <p>Progress: {item.progress ?? 0}%</p>
          </article>
        ))}
      </div>
    </main>
  );
}

function NotFound() {
  return <main className="page"><h1>Page not found</h1><Link to="/">Go Home</Link></main>;
}

function Layout() {
  return (
    <>
      <nav className="navbar">
        <Link className="brand" to="/">LearnHub</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/my-courses">My Courses</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="footer">© 2026 LearnHub LMS</footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
