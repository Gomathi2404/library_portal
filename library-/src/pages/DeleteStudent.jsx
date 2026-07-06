import { useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
const YEAR_OPTIONS_CLASS = ["I Year","II Year","III Year","IV Year"];
const DEPT_OPTIONS_CLASS = ["CSE","ECE","MECH","AI&DS","IT","Civil","EEE","S&H","MBA","MCA"];

export default function DeleteStudent({ dept, onBack, onDeleted }) {
  const isAdmin = dept === "admin" || !dept;

  const [classYear, setClassYear] = useState("");
  const [classDept, setClassDept] = useState(dept || "CS");
  const [deleting, setDeleting]   = useState(false);
  const [classMsg, setClassMsg]   = useState(null);

  const handleClassDelete = async () => {
    if (!window.confirm(`Delete all members from ${classYear} ${classDept}? This action cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/delete_class.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: classYear, department: classDept, admin_dept: dept })
      });
      const data = await res.json();
      setClassMsg({ type: data.status, text: data.message });
      if (data.status === "success") {
        setClassYear("");
        setClassDept(dept || "CS");
        if (onDeleted) onDeleted();
        setTimeout(() => setClassMsg(null), 4000);
      }
    } catch {
      setClassMsg({ type: "error", text: "Server error." });
    }
    setDeleting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && <button className="btn" onClick={onBack}>Back</button>}
          <h1 className="page-title">Delete Student</h1>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Delete Students</div>
        {classMsg && (
          <div className={`alert alert-${classMsg.type === "success" ? "success" : "error"}`} style={{ marginBottom: "1rem" }}>
            {classMsg.text}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="form-group" style={{ minWidth: 160, marginBottom: 0 }}>
            <label>Year</label>
            <select value={classYear} onChange={e => setClassYear(e.target.value)}>
              <option value="">Select Year</option>
              {YEAR_OPTIONS_CLASS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 160, marginBottom: 0 }}>
            <label>Department</label>
            {isAdmin ? (
              <select value={classDept} onChange={e => setClassDept(e.target.value)}>
                {DEPT_OPTIONS_CLASS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <input readOnly value={dept} style={{ background: "#e3f2fd", fontWeight: 500, color: "#000" }} />
            )}
          </div>
          <div style={{ paddingBottom: 1 }}>
            <button
              className="btn btn-danger"
              onClick={handleClassDelete}
              disabled={deleting || !classYear}
              style={{ height: 38 }}>
              {deleting ? "Deleting..." : "Delete All Students"}
            </button>
          </div>
          {classYear && classDept && (
            <div style={{ fontSize: 12, color: "#000", paddingBottom: 4 }}>
              Will delete all students in: <strong style={{ color: "#000" }}>{classYear} {classDept}</strong>
            </div>
          )}
        </div>
        <div style={{ marginTop: "0.75rem", fontSize: 11, color: "#9aa3b0" }}>
          Students with currently issued books cannot be deleted. Return all books first.
        </div>
      </div>
    </div>
  );
}