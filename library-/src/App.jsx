import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminAccounts from "./pages/AdminAccounts";
import Books from "./pages/Books";
import BookCopies from "./pages/BookCopies";
import AddBook from "./pages/AddBook";
import IssueBook from "./pages/IssueBook";
import Returns from "./pages/Returns";
import Overdue from "./pages/Overdue";
import Members from "./pages/Members";
import Transactions from "./pages/Transactions";
import PromoteStudents from "./pages/PromoteStudents";
import "./App.css";
import AddMember from "./pages/AddMember";
import DeleteStudent from "./pages/DeleteStudent";
export default function App() {
  const [dept, setDept]         = useState(localStorage.getItem("dept")         || null);
  const [username, setUsername] = useState(localStorage.getItem("user")         || null);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("dept"));
  const [page, setPage]         = useState("dashboard");
  const [viewAsDept, setViewAsDept] = useState(null);

  // Student session
  const [student, setStudent]         = useState(() => {
    const id = localStorage.getItem("student_id");
    if (!id) return null;
    return {
      member_id:   id,
      name:        localStorage.getItem("student_name") || "",
      roll_no:     localStorage.getItem("student_roll") || "",
      department:  localStorage.getItem("student_dept") || "",
      year:        localStorage.getItem("student_year") || "",

     
      member_type: localStorage.getItem("student_type") || "student"
    };
  });
  const [studentLoggedIn, setStudentLoggedIn] = useState(!!localStorage.getItem("student_id"));

  const isAdmin     = dept === "admin";
  const effectiveDept = viewAsDept || dept;

  // ---- ADMIN LOGIN ----
  const handleLogin = (department, user) => {
    setDept(department); setUsername(user); setLoggedIn(true);
  };

  // ---- STUDENT LOGIN ----
  const handleStudentLogin = (data) => {
    localStorage.setItem("student_id",    data.member_id);
    localStorage.setItem("student_name",  data.name);
    localStorage.setItem("student_roll",  data.roll_no);
    localStorage.setItem("student_dept",  data.department);
    localStorage.setItem("student_year",  data.year);
    localStorage.setItem("student_type",  data.member_type || "student");
    setStudent(data);
    setStudentLoggedIn(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("dept"); localStorage.removeItem("user");
    setDept(null); setUsername(null); setLoggedIn(false);
    setPage("dashboard"); setViewAsDept(null);
  };

  const handleStudentLogout = () => {
    ["student_id","student_name","student_roll","student_dept","student_year","student_type"]
      .forEach(k => localStorage.removeItem(k));
    setStudent(null); setStudentLoggedIn(false);
  };

  // Student portal
  if (studentLoggedIn && student) {
    return <StudentDashboard student={student} onLogout={handleStudentLogout} />;
  }

  // Auth wall
  if (!loggedIn) {
    return <Login onLogin={handleLogin} onStudentLogin={handleStudentLogin} />;
  }

  const renderPage = () => {
    // Super admin dashboard only when dept is literally "admin" and viewing dashboard
    if (dept === "admin" && !viewAsDept && page === "dashboard") {
      return <SuperAdminDashboard onViewDept={(d) => { setViewAsDept(d); setPage("dashboard"); }} />;
    }
    // All other pages based on current page
    switch (page) {
      case "accounts":     return <AdminAccounts onBack={() => setPage("dashboard")} />;
      case "dashboard":    return <Dashboard dept={effectiveDept} />;
      case "books":        return <Books dept={effectiveDept} />;
      case "bookcopies":  return <BookCopies dept={effectiveDept} />;
      case "addbook":      return <AddBook dept={effectiveDept} onSuccess={() => setPage("books")} />;
      case "issue":        return <IssueBook dept={effectiveDept} />;
      case "returns":      return <Returns dept={effectiveDept} />;
      case "overdue":      return <Overdue dept={effectiveDept} />;
      case "members":      return <Members dept={effectiveDept} />;
      case "transactions": return <Transactions dept={effectiveDept} />;
      case "promote":      return <PromoteStudents dept={effectiveDept} />;
      case "addmember":    return <AddMember dept={effectiveDept} onBack={() => setPage("members")} onAdded={() => setPage("members")} />;
      case "deletestudent": return <DeleteStudent dept={effectiveDept} onBack={() => setPage("members")} onDeleted={() => setPage("members")} />;
      default:             return <Dashboard dept={effectiveDept} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={page} onNavigate={setPage} onLogout={handleAdminLogout} dept={effectiveDept} username={username} />
      <main className="main-content">
        {dept === "admin" && viewAsDept && (
          <div style={{ background:"#e3f2fd", border:"1px solid #90caf9", borderRadius:6, padding:"8px 14px", marginBottom:"1rem", fontSize:13, color:"#000", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span>Viewing as Super Admin </span>
            <button className="btn btn-sm" style={{ background:"#1565c0", color:"#fff", border:"none" }}
              onClick={() => { setViewAsDept(null); setPage("dashboard"); }}>
              Back to Overview
            </button>
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  );
}