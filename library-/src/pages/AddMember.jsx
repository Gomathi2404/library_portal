import { useState } from "react";

const API = "http://localhost/LIBRARY_PORTAL/library";
const DEPT_OPTIONS = ["CSE","ECE","MECH","AI&DS","IT","Civil","EEE","S&H","MBA","MCA","ICE"];
const YEAR_OPTIONS = ["I Year","II Year","III Year","IV Year","Faculty"];
const SECTION_OPTIONS = ["A","B"];

export default function AddMember({ dept, onBack, onAdded }) {
  const isAdmin = dept === "admin" || !dept;

  const [form, setForm]   = useState({ section: "" });
  const [msg, setMsg]     = useState(null);
  const [saving, setSaving] = useState(false);

  const inputStyle = {
    padding: "9px 12px",
    border: "1px solid #90caf9",
    borderRadius: 6,
    fontSize: 13,
    width: "100%",
  };

  const handleDeptChange = (newDept) => {
    setForm(prev => ({ ...prev, department: newDept }));
  };

  const handleSubmit = async () => {
    if (
      !form.roll_no?.toString().trim() ||
      !form.name?.toString().trim() ||
      !form.year?.toString().trim() ||
      !form.member_type?.toString().trim()
    ) {
      setMsg({ type: "error", text: "Roll No, Name, Year, and Member Type are required fields." });
      return;
    }

    setSaving(true); setMsg(null);
    try {
      const payload = {
        roll_no: form.roll_no,
        name: form.name,
        department: form.department,
        year: form.year,
        member_type: form.member_type,
        section: form.section || "",
        admin_dept: dept
      };
      if (!isAdmin) payload.department = dept;

      const res  = await fetch(`${API}/members.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setMsg({ type: data.status, text: data.message });

      if (data.status === "success") {
        setForm({ section: "" });
        if (onAdded) onAdded();
      }
    } catch {
      setMsg({ type: "error", text: "Server error." });
    }
    setSaving(false);
  };

  const clearForm = () => { setForm({ section: "" }); setMsg(null); };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && <button className="btn" style={{background:"#c2e3fc"}} onClick={onBack}>Back</button>}
          <h1 className="page-title">Add Member</h1>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-title">New Member Details</div>

        <div className="form-grid">
          <div className="form-group">
            <label>Roll No. *</label>
            <input
              style={inputStyle}
              value={form.roll_no || ""}
              onChange={e => setForm({ ...form, roll_no: e.target.value })}
              placeholder="Roll number"
            />
          </div>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              style={inputStyle}
              value={form.name || ""}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Department *</label>
            {isAdmin ? (
              <select
                style={inputStyle}
                value={form.department || ""}
                onChange={e => handleDeptChange(e.target.value)}
              >
                <option value="">Select Department</option>
                {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input readOnly style={{ ...inputStyle, background: "#e3f2fd", color: "#000", fontWeight: 500, border: "1px solid #b0d2ee" }} value={dept} />
            )}
          </div>
          <div className="form-group">
            <label>Section</label>
            <select
              style={inputStyle}
              value={form.section || ""}
              onChange={e => setForm({ ...form, section: e.target.value })}
            >
              <option value="">-</option>
              {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Year *</label>
            <select
              style={inputStyle}
              value={form.year || ""}
              onChange={e => setForm({ ...form, year: e.target.value })}
            >
              <option value="">Select Year</option>
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Member Type *</label>
            <select
              style={inputStyle}
              value={form.member_type || ""}
              onChange={e => setForm({ ...form, member_type: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Add Member"}
          </button>
          <button className="btn" style={{ background: "#b6d9f1", color: "#000", border: "1px solid #90caf9" }} onClick={clearForm}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}