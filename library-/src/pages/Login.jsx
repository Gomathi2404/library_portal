import { useState, useEffect } from "react";

const API = "http://localhost/LIBRARY_PORTAL/library";

const DEPT_OPTIONS = [
  "CSE", "ECE", "MECH", "AI&DS", "IT", "Civil", "EEE", "S&H", "MBA", "MCA" ,"ICE"
];

const COLORS = {
  primary: "#3b82f6",
  primaryDark: "#1d4ed8",
  sidebarBg: "#1e3a8a",
  bgGradient: "#3b82f6",
  border: "rgba(59, 130, 246, 0.3)",
  textMain: "#ffffff",
  textMuted: "#e0e7ff",
  textSecondary: "rgba(255, 255, 255, 0.8)",
  accentRed: "#ef4444",
  accentRedLight: "rgba(239, 68, 68, 0.15)",
  accentGreen: "#10b981",
  accentGreenLight: "rgba(16, 185, 129, 0.15)",
};

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
const TRANSITION = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

// Lock Screen Component
const LockScreen = ({ onUnlock, logoUrl, bgUrl }) => {
  useEffect(() => {
    const handleUnlock = () => onUnlock();
    window.addEventListener("click", handleUnlock);
    window.addEventListener("keydown", handleUnlock);
    return () => {
      window.removeEventListener("click", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, [onUnlock]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `url('${bgUrl}'), linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        zIndex: 9999,
        animation: "lockScreenFadeOut 0.8s ease-out forwards",
        animationDelay: "3s",
      }}
    >
      <style>{`
        @keyframes lockScreenFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.3); }
          50% { box-shadow: 0 0 40px rgba(37, 99, 235, 0.6); }
        }
      `}</style>

      {/* Logo with Glow */}
      <div
        style={{
          marginBottom: "3rem",
          animation: "slideUp 0.8s ease-out",
        }}
      >
        <div
          style={{
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.98)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(37, 99, 235, 0.4)",
            border: "4px solid rgba(255, 255, 255, 0.5)",
            overflow: "hidden",
            animation: "glow 3s ease-in-out infinite",
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="College Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ fontSize: "48px" }}>🏛️</div>
          )}
        </div>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "48px",
          fontWeight: 900,
          color: "#ffffff",
          margin: "0 0 1.5rem",
          textAlign: "center",
          letterSpacing: "2px",
          textTransform: "uppercase",
          textShadow: "0 8px 24px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(37, 99, 235, 0.4)",
          animation: "slideUp 0.8s ease-out 0.1s both",
          maxWidth: "90%",
          lineHeight: "1.2",
        }}
      >
        A.V.C. College of Engineering
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "rgba(255, 255, 255, 0.95)",
          margin: "0 0 4rem",
          textAlign: "center",
          letterSpacing: "1.5px",
          textShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          animation: "slideUp 0.8s ease-out 0.2s both",
        }}
      >
        LIBRARY PORTAL
      </p>

      {/* Lock Icon + Text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          animation: "slideUp 0.8s ease-out 0.3s both",
        }}
      >
        
        
      </div>
    </div>
  );
};

// Main Login Component
export default function LoginMerged({ onLogin, onStudentLogin, logoUrl = "/src/assets/logo.png", bgUrl = "/src/assets/bg.png", collegeBgUrl = "/src/assets/bg2.png" }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [tab, setTab] = useState("admin");
  const [loading, setLoading] = useState(false);

  // Admin login
  const [aForm, setAForm] = useState({ username: "", password: "" });
  const [aMsg, setAMsg] = useState(null);

  // Student login
  const [sForm, setSForm] = useState({ username: "", password: "" });
  const [sMsg, setSMsg] = useState(null);

  // Change password
  const [cForm, setCForm] = useState({ username: "", old_password: "", new_password: "", confirm: "" });
  const [cMsg, setCMsg] = useState(null);

  // Register dept
  const [rForm, setRForm] = useState({ department: "CSE", username: "", password: "", confirm: "" });
  const [rMsg, setRMsg] = useState(null);

  const switchTab = (t) => {
    setTab(t);
    setAMsg(null);
    setSMsg(null);
    setCMsg(null);
    setRMsg(null);
  };

  // ---- ADMIN LOGIN ----
  const handleAdminLogin = async () => {
    if (!aForm.username.trim() || !aForm.password.trim()) {
      setAMsg({ type: "error", text: "Please enter username and password." });
      return;
    }
    setLoading(true);
    setAMsg(null);
    try {
      const res = await fetch(`${API}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: aForm.username.trim(), password: aForm.password.trim() })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setAMsg({ type: "error", text: "Invalid server response." });
        setLoading(false);
        return;
      }
      if (data.status === "success") {
        localStorage.setItem("dept", data.department);
        localStorage.setItem("user", data.username);
        onLogin(data.department, data.username);
      } else {
        setAMsg({ type: "error", text: data.message });
      }
    } catch {
      setAMsg({ type: "error", text: "Connection refused." });
    }
    setLoading(false);
  };

  // ---- STUDENT LOGIN ----
  const handleStudentLogin = async () => {
    if (!sForm.username.trim() || !sForm.password.trim()) {
      setSMsg({ type: "error", text: "Please enter your Roll Number in both fields." });
      return;
    }
    setLoading(true);
    setSMsg(null);
    try {
      const res = await fetch(`${API}/student_login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: sForm.username.trim(), password: sForm.password.trim() })
      });
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("student_id", data.member_id);
        localStorage.setItem("student_name", data.name);
        localStorage.setItem("student_roll", data.roll_no);
        localStorage.setItem("student_dept", data.department);
        localStorage.setItem("student_year", data.year);
        localStorage.setItem("student_type", data.member_type || "student");
        onStudentLogin(data);
      } else {
        setSMsg({ type: "error", text: data.message });
      }
    } catch {
      setSMsg({ type: "error", text: "Connection refused." });
    }
    setLoading(false);
  };

  // ---- CHANGE PASSWORD ----
  const handleChangePassword = async () => {
    if (!cForm.username.trim() || !cForm.old_password.trim() || !cForm.new_password.trim()) {
      setCMsg({ type: "error", text: "All fields are required." });
      return;
    }
    if (cForm.new_password !== cForm.confirm) {
      setCMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (cForm.new_password.length < 4) {
      setCMsg({ type: "error", text: "New password must be at least 4 characters." });
      return;
    }
    setLoading(true);
    setCMsg(null);
    try {
      const res = await fetch(`${API}/change_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cForm.username.trim(),
          old_password: cForm.old_password.trim(),
          new_password: cForm.new_password.trim()
        })
      });
      const data = await res.json();
      setCMsg({ type: data.status, text: data.message });
      if (data.status === "success") {
        setCForm({ username: "", old_password: "", new_password: "", confirm: "" });
        setTimeout(() => switchTab("student"), 2000);
      }
    } catch {
      setCMsg({ type: "error", text: "Connection refused." });
    }
    setLoading(false);
  };

  // ---- REGISTER DEPT ----
  const handleRegister = async () => {
    if (!rForm.username.trim() || !rForm.password.trim() || !rForm.department) {
      setRMsg({ type: "error", text: "All fields are required." });
      return;
    }
    if (rForm.password !== rForm.confirm) {
      setRMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (rForm.password.length < 4) {
      setRMsg({ type: "error", text: "Password must be at least 4 characters." });
      return;
    }
    setLoading(true);
    setRMsg(null);
    try {
      const res = await fetch(`${API}/admin_manage.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: rForm.username.trim(), password: rForm.password, department: rForm.department })
      });
      const data = await res.json();
      setRMsg({ type: data.status, text: data.message });
      if (data.status === "success") {
        setRForm({ department: "CSE", username: "", password: "", confirm: "" });
        setTimeout(() => switchTab("admin"), 2000);
      }
    } catch {
      setRMsg({ type: "error", text: "Connection refused." });
    }
    setLoading(false);
  };

  const tabs = [
    { id: "admin", label: "Department Login" },
    { id: "student", label: "Student Login" },
    { id: "register", label: "Department Registration" },
    // { id: "change_password", label: "Change Password", icon: "ti-key" }
  ];

  const renderAlert = (msg) => {
    if (!msg) return null;
    const isError = msg.type === "error";
    return (
      <div
        style={{
          padding: "12px 14px",
          borderRadius: "10px",
          marginBottom: "1rem",
          fontSize: "13px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: isError ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
          color: isError ? COLORS.accentRed : COLORS.accentGreen,
          border: `2px solid ${isError ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
          borderRadius: "10px",
          animation: "slideIn 0.3s ease-out",
          backdropFilter: "blur(8px)",
        }}
      >
        <i className={`ti ${isError ? "ti-alert-circle" : "ti-check"}`} style={{ fontSize: "16px" }} />
        {msg.text}
      </div>
    );
  };

  const renderInput = (value, onChange, placeholder, type = "text", onKeyDown) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "12px 14px",
        fontSize: "14px",
        border: `2px solid ${COLORS.border}`,
        borderRadius: "10px",
        background: "rgba(255, 255, 255, 0.95)",
        color: "#1e293b",
        fontFamily: FONT,
        transition: TRANSITION,
        boxSizing: "border-box",
        fontWeight: 500,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = COLORS.primary;
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59, 130, 246, 0.1)`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(15px); }
        }
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: rgba(30, 58, 138, 0.4);
        }
        select {
          color: inherit;
        }
        select option {
          background: ${COLORS.sidebarBg};
          color: ${COLORS.textMain};
        }
      `}</style>

      {/* Lock Screen */}
      {!isUnlocked && (
        <LockScreen 
          onUnlock={() => setIsUnlocked(true)} 
          logoUrl={logoUrl}
          bgUrl={collegeBgUrl}
        />
      )}

      {/* Main Login Page */}
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: `url('${bgUrl}'), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          position: "relative",
          overflow: "hidden",
          padding: "2rem",
          animation: isUnlocked ? "slideIn 0.6s ease-out" : "none",
        }}
      >
        {/* Animated Blobs */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-10%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />

        {/* Main Container */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "515px",
            animation: "slideIn 0.6s ease-out",
          }}
        >
          {/* Glass Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "2px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "20px",
              padding: "2rem",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 8px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
              animation: "slideIn 0.6s ease-out",
              transform: "perspective(1200px) rotateX(0.3deg)",
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              const rotX = (y - 0.5) * 1.5;
              const rotY = (x - 0.5) * 1.5;
              e.currentTarget.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1200px) rotateX(0.3deg)";
            }}
          >
            {/* Content */}
            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    margin: "0 auto 1rem",
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, #8b5cf6 100%)`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.textMain,
                    fontSize: "32px",
                    fontWeight: 800,
                    boxShadow: `0 8px 20px rgba(59, 130, 246, 0.25)`,
                    border: "3px solid rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <i className="ti ti-books" />
                  )}
                </div>
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    color: "#1e293b",
                    margin: "0 0 0.3rem",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Library Portal
                </h1>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  A.V.C. College of Engineering
                </p>
              </div>

              {/* Tab Navigation */}
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  marginBottom: "1.5rem",
                  padding: "0.5rem",
                  background: "rgba(226, 232, 240, 0.6)",
                  borderRadius: "12px",
                  overflowX: "auto",
                }}
              >
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => switchTab(t.id)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: "10px",
                      background: tab === t.id ? `linear-gradient(135deg, ${COLORS.primary} 0%, #8b5cf6 100%)` : "transparent",
                      color: tab === t.id ? COLORS.textMain : "#64748b",
                      cursor: "pointer",
                      transition: TRANSITION,
                      fontFamily: FONT,
                      whiteSpace: "nowrap",
                      boxShadow: tab === t.id ? `0 4px 12px rgba(59, 130, 246, 0.25)` : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (tab !== t.id) {
                        e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tab !== t.id) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <i className={`ti ${t.icon}`} style={{ marginRight: "4px", fontSize: "12px" }} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── ADMIN LOGIN ── */}
              {tab === "admin" && (
                <div>
                  {renderAlert(aMsg)}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Username
                    </label>
                    {renderInput(aForm.username, (e) => setAForm({ ...aForm, username: e.target.value }),"" ,"text", (e) => e.key === "Enter" && handleAdminLogin())}
                  </div>
                  <div style={{ marginBottom: "1.3rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Password
                    </label>
                    {renderInput(aForm.password, (e) => setAForm({ ...aForm, password: e.target.value }), "Password", "password", (e) => e.key === "Enter" && handleAdminLogin())}
                  </div>
                  <button
                    onClick={handleAdminLogin}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: "10px",
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, #8b5cf6 100%)`,
                      color: COLORS.textMain,
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: TRANSITION,
                      fontFamily: FONT,
                      boxShadow: `0 6px 16px rgba(59, 130, 246, 0.3)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px rgba(59, 130, 246, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 6px 16px rgba(59, 130, 246, 0.3)`;
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255, 255, 255, 0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-login" style={{ fontSize: "14px" }} />
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ── STUDENT LOGIN ── */}
              {tab === "student" && (
                <div>
                  {renderAlert(sMsg)}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Roll Number
                    </label>
                    {renderInput(sForm.username, (e) => setSForm({ ...sForm, username: e.target.value }), "Enter your roll number", "text", (e) => e.key === "Enter" && handleStudentLogin())}
                  </div>
                  <div style={{ marginBottom: "1.3rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Password
                    </label>
                    {renderInput(sForm.password, (e) => setSForm({ ...sForm, password: e.target.value }), "Default: your roll number", "password", (e) => e.key === "Enter" && handleStudentLogin())}
                  </div>
                  <button
                    onClick={handleStudentLogin}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: "10px",
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, #8b5cf6 100%)`,
                      color: COLORS.textMain,
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: TRANSITION,
                      fontFamily: FONT,
                      boxShadow: `0 6px 16px rgba(59, 130, 246, 0.3)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px rgba(59, 130, 246, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 6px 16px rgba(59, 130, 246, 0.3)`;
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255, 255, 255, 0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-login" style={{ fontSize: "14px" }} />
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ── CHANGE PASSWORD ── */}
              {tab === "change_password" && (
                <div>
                  {renderAlert(cMsg)}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Roll Number
                    </label>
                    {renderInput(cForm.username, (e) => setCForm({ ...cForm, username: e.target.value }), "Enter your roll number")}
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Current Password
                    </label>
                    {renderInput(cForm.old_password, (e) => setCForm({ ...cForm, old_password: e.target.value }), "Your current password", "password")}
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      New Password
                    </label>
                    {renderInput(cForm.new_password, (e) => setCForm({ ...cForm, new_password: e.target.value }), "Choose a new password", "password")}
                  </div>
                  <div style={{ marginBottom: "1.3rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Confirm Password
                    </label>
                    {renderInput(cForm.confirm, (e) => setCForm({ ...cForm, confirm: e.target.value }), "Repeat new password", "password", (e) => e.key === "Enter" && handleChangePassword())}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: "10px",
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, #8b5cf6 100%)`,
                      color: COLORS.textMain,
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: TRANSITION,
                      fontFamily: FONT,
                      boxShadow: `0 6px 16px rgba(59, 130, 246, 0.3)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px rgba(59, 130, 246, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 6px 16px rgba(59, 130, 246, 0.3)`;
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255, 255, 255, 0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-key" style={{ fontSize: "14px" }} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ── REGISTER DEPT ── */}
              {tab === "register" && (
                <div>
                  {renderAlert(rMsg)}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Department
                    </label>
                    <select
                      value={rForm.department}
                      onChange={(e) => setRForm({ ...rForm, department: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        fontSize: "14px",
                        border: `2px solid ${COLORS.border}`,
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.95)",
                        color: "#1e293b",
                        fontFamily: FONT,
                        transition: TRANSITION,
                        boxSizing: "border-box",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = COLORS.primary;
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59, 130, 246, 0.1)`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = COLORS.border;
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {DEPT_OPTIONS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Username
                    </label>
                    {renderInput(rForm.username, (e) => setRForm({ ...rForm, username: e.target.value }), "Department admin username")}
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Password
                    </label>
                    {renderInput(rForm.password, (e) => setRForm({ ...rForm, password: e.target.value }), "Create a password", "password")}
                  </div>
                  <div style={{ marginBottom: "1.3rem" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Confirm Password
                    </label>
                    {renderInput(rForm.confirm, (e) => setRForm({ ...rForm, confirm: e.target.value }), "Repeat password", "password", (e) => e.key === "Enter" && handleRegister())}
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: "10px",
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, #8b5cf6 100%)`,
                      color: COLORS.textMain,
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: TRANSITION,
                      fontFamily: FONT,
                      boxShadow: `0 6px 16px rgba(59, 130, 246, 0.3)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 20px rgba(59, 130, 246, 0.4)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 6px 16px rgba(59, 130, 246, 0.3)`;
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255, 255, 255, 0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-user-plus" style={{ fontSize: "14px" }} />
                        Register
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: `2px solid rgba(226, 232, 240, 0.8)`,
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}