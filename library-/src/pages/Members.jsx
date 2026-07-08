import { useEffect, useState, useRef } from "react";
import MemberProfile from "./MemberProfile";
import { parseCSV, downloadCSVTemplate } from "../utils/csvParser";

const API = "http://localhost/LIBRARY_PORTAL/library";
const DEPT_OPTIONS = ["CSE","ECE","MECH","AI&DS","IT","Civil","EEE","S&H","MBA","MCA","ICE"];
const YEAR_OPTIONS = ["I Year","II Year","III Year","IV Year","Alumni","Faculty"];
const SECTION_OPTIONS = ["A","B"];

export default function Members({ dept }) {
  const isAdmin   = dept === "admin" || !dept;
  const fixedDept = isAdmin ? "" : dept;
  const emptyForm = { section: "" };

  const [members, setMembers]           = useState([]);
  const [search, setSearch]             = useState("");
  const [tab, setTab]                   = useState("all");
  const [yearFilter, setYearFilter]     = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [msg, setMsg]                   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [viewMemberId, setViewMemberId] = useState(null);
  const [editId, setEditId]             = useState(null);
  const [editData, setEditData]         = useState({});
  const [editSaving, setEditSaving]     = useState(false);
  const [uploadMsg, setUploadMsg]       = useState(null);
  const [uploading, setUploading]       = useState(false);
  const fileRef                         = useRef();

  const fetchMembers = (q = "", type = "", yr = "") => {
    setLoading(true);
    fetch(`${API}/members.php?search=${encodeURIComponent(q)}&type=${type}&year=${encodeURIComponent(yr)}&dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => { 
        setMembers(d.data || []); 
        setLoading(false); 
      })
      .catch(() => {
        setMembers([]);
        setLoading(false);
      });
  };

  useEffect(() => { 
    fetchMembers(search, tab === "all" ? "" : tab, yearFilter); 
  }, [tab, yearFilter, dept]);

  const handleSearch = e => { 
    setSearch(e.target.value); 
    fetchMembers(e.target.value, tab === "all" ? "" : tab, yearFilter); 
  };

  // Keep Section in sync when Department changes on the Add form —
  const handleFormDeptChange = (newDept) => {
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
      const res  = await fetch(`${API}/members.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      setMsg({ type: data.status, text: data.message });
      if (data.status === "success") { setForm(emptyForm); setShowForm(false); fetchMembers(search, tab === "all" ? "" : tab, yearFilter); }
    } catch { setMsg({ type: "error", text: "Server error." }); }
    setSaving(false); setTimeout(() => setMsg(null), 5000);
  };

  const deleteMember = (id, name) => {
    if (!window.confirm(`Remove member "${name}"?`)) return;
    fetch(`${API}/members.php?id=${id}&dept=${encodeURIComponent(dept)}`, { method: "DELETE" })
      .then(r => r.json())
      .then(d => { setMsg({ type: d.status, text: d.message }); fetchMembers(search, tab === "all" ? "" : tab, yearFilter); setTimeout(() => setMsg(null), 3000); });
  };

  const startEdit = (m) => {
    setEditId(m.id);
    setEditData({
      roll_no: m.roll_no,
      name: m.name,
      department: m.department,
      year: m.year,
      member_type: m.member_type,
      section: m.section || ""
    });
  };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const handleEditDeptChange = (newDept) => {
    setEditData(prev => ({ ...prev, department: newDept }));
  };

  const saveEdit = async () => {
    if (!editData.roll_no.trim() || !editData.name.trim()) { setMsg({ type: "error", text: "Roll No. and Name required." }); return; }
    setEditSaving(true); setMsg(null);
    try {
      const res  = await fetch(`${API}/update_member.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...editData, section: editData.section || "", admin_dept: dept }) });
      const data = await res.json();
      setMsg({ type: data.status, text: data.message });
      if (data.status === "success") { setEditId(null); setEditData({}); fetchMembers(search, tab === "all" ? "" : tab, yearFilter); }
    } catch { setMsg({ type: "error", text: "Server error." }); }
    setEditSaving(false); setTimeout(() => setMsg(null), 4000);
  };

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=700");
    const safeMembers = members || [];

    const deptNames = {
      CSE: "Department of Computer Science and Engineering (CSE)",
      ECE: "Department of Electronics and Communication Engineering (ECE)",
      EEE: "Department of Electrical and Electronics Engineering (EEE)",
      IT: "Department of Information Technology (IT)",
      MECH: "Department of Mechanical Engineering (MECH)",
      CIVIL: "Department of Civil Engineering (CIVIL)",
      MBA: "Department of Master of Business Administration (MBA)",
      MCA: "Department of Master of Computer Applications (MCA)",
      "AI&DS": "Department of Artificial Intelligence and Data Science (AI&DS)",
      "S&H": "Department of Science and Humanities (S&H)",
      "ICE": "Department of Instrumentation and Control Engineering (ICE)"
    };

    const titleText = isAdmin
      ? "All Departments"
      : (deptNames[dept] || ((dept ? dept.toUpperCase() : "") + " Department"));

    let rowsHtml = "";
    safeMembers.forEach((m, i) => {
      rowsHtml += "<tr>" +
        "<td>" + (i + 1) + "</td>" +
        "<td>" + (m.roll_no || "") + "</td>" +
        "<td>" + (m.name || "") + "</td>" +
        "<td>" + (m.department || "") + "</td>" +
        "<td>" + (m.section || "") + "</td>" +
        "<td>" + (m.year || "") + "</td>" +
        "<td>" + (m.member_type || "") + "</td>" +
        "<td style='text-align:center'>" + (m.total_issued || 0) + "</td>" +
        "<td style='text-align:center'>" + (m.total_returned || 0) + "</td>" +
        "</tr>";
    });

    win.document.write(
      "<!DOCTYPE html><html><head>" +
      "<title>Members</title>" +
      "<style>" +
        "@page { size: A4 auto; margin: 18mm 15mm; }" +
        "body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }" +
        ".hdr { text-align:center; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:14px; }" +
        ".hdr h1 { font-size:16px; } .hdr h2 { font-size:13px; margin-top:4px; } .hdr p { font-size:10px; margin-top:4px; }" +
        "table { width:100%; border-collapse:collapse; }" +
        "th { background:#1c2333; color:#fff; padding:7px 8px; font-size:10px; text-align:left; border:1px solid #000; }" +
        "td { padding:6px 8px; border:1px solid #000; font-size:10px; }" +
        "tr:nth-child(even) td { background:#f9f9f9; }" +
        ".sig { display:flex; justify-content:space-between; margin-top:60px; padding-top:16px; border-top:1px solid #000; }" +
        ".sb { text-align:center; width:200px; }" +
        ".sl { border-top:1px solid #000; padding-top:6px; font-size:11px; font-weight:bold; margin-top:48px; }" +
      "</style></head><body>" +
      "<div class='hdr'>" +
        "<h1>A.V.C. College of Engineering</h1>" +
        "<h2>Library Member Register — " + titleText + "</h2>" +
        "<p>Generated: " + new Date().toLocaleDateString("en-IN", { dateStyle: "long" }) + "</p>" +
      "</div>" +
      "<table>" +
        "<thead><tr><th>#</th><th>Roll No.</th><th>Name</th><th>Department</th><th>Section</th><th>Year</th><th>Type</th><th>Total Issued</th><th>Returned</th></tr></thead>" +
        "<tbody>" + rowsHtml + "</tbody>" +
      "</table>" +
      "<div class='sig'><div class='sb'><div class='sl'>Department Library Incharge</div></div><div class='sb'><div class='sl'>HOD</div></div></div>" +
      "<div style='position:fixed; bottom:10px; width:100%; text-align:center; font-size:9px; color:#000;'>Developed by Department of AI&DS</div>" +
      "</body></html>"
    );
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 400);
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); setUploadMsg(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows.length) { setUploadMsg({ type: "error", text: "CSV file is empty or invalid." }); setUploading(false); return; }

      let hasInvalidRow = false;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (
          !row.roll_no?.toString().trim() || 
          !row.name?.toString().trim() || 
          !row.year?.toString().trim() || 
          !row.member_type?.toString().trim()
        ) {
          hasInvalidRow = true;
          break; 
        }
      }

      if (hasInvalidRow) {
        setUploadMsg({ 
          type: "error", 
          text: " File not uploaded. Roll No, Name, Year, and Member Type are required fields." 
        });
        setUploading(false);
        fileRef.current.value = "";
        return; 
      }

      const fd = new FormData(); fd.append("type", "members"); fd.append("admin_dept", dept); fd.append("rows", JSON.stringify(rows));
      const res  = await fetch(`${API}/bulk_upload.php`, { method: "POST", body: fd });
      const data = await res.json();
      setUploadMsg({ type: data.status, text: data.message + (data.errors?.length ? " | " + data.errors.join("; ") : "") });
      fetchMembers(search, tab === "all" ? "" : tab, yearFilter);
    } catch { setUploadMsg({ type: "error", text: "Failed to parse CSV file." }); }
    setUploading(false); fileRef.current.value = "";
  };

  const downloadTemplate = () => {
    downloadCSVTemplate("members_template.csv",
      ["roll_no", "name", "department", "section", "year", "member_type"],
      { roll_no: "", name: "", department: "", section: "", year: "", member_type: "" }
    );
  };

  if (viewMemberId) return <MemberProfile memberId={viewMemberId} dept={dept} onBack={() => setViewMemberId(null)} />;

  const inputStyle = { padding: "5px 8px", border: "1px solid #90caf9", borderRadius: 4, fontSize: 12, width: "100%", minWidth: 80 };
  const safeMembersList = members || [];

  return (
    <div style={{marginLeft:"28px",width:"calc(100%-280px)",height:"100vh",overflowY:"auto",padding:"20px"}}>
      <div className="page-header">
        <h1 className="page-title">Members — {isAdmin ? "All Departments" : (dept ? dept.toUpperCase() : "")}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-wrap" style={{ maxWidth: 220 }}>
            <span className="search-icon">&#9906;</span>
            <input placeholder="Search name or roll no..." value={search} onChange={handleSearch} />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="btn" onClick={handlePrint}>Print</button>
          </div>
          <button className="btn" onClick={downloadTemplate} style={{ background: "#e8f5e9", color: "#000", border: "1px solid #a5d6a7" }}>Template</button>
          <label style={{ cursor:"pointer" }}>
            <input type="file" accept=".csv" ref={fileRef} onChange={handleCSVUpload} style={{ display:"none" }} />
            <span className="btn" style={{ background: "#e3f2fd", color: "#000", border: "1px solid #90caf9" }}>
              {uploading ? "Uploading..." : " Upload Members"}
            </span>
          </label>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setMsg(null); }}>
            {showForm ? "Cancel" : "Add Member"}
          </button>
        </div>
      </div>

      {msg       && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}
      {uploadMsg && <div className={`alert alert-${uploadMsg.type === "success" ? "success" : "error"}`}>{uploadMsg.text}</div>}

      {showForm && (
        <div className="card">
          <div className="card-title">Add New Member</div>
          <div className="form-grid">
            <div className="form-group"><label>Roll No. *</label><input value={form.roll_no || ""} onChange={e => setForm({ ...form, roll_no: e.target.value })}  /></div>
            <div className="form-group"><label>Full Name *</label><input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Department *</label>
              {isAdmin ? (
                <select value={form.department || ""} onChange={e => handleFormDeptChange(e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input readOnly value={dept} style={{ background: "#f7f8fa", color: "#2e7d32", fontWeight: 700 }} />
              )}
            </div>
            <div className="form-group"><label>Section</label>
              <select value={form.section || ""} onChange={e => setForm({ ...form, section: e.target.value })}>
                <option value="">-</option>
                {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Year *</label>
              <select value={form.year || ""} onChange={e => setForm({ ...form, year: e.target.value })}>
                <option value="">Select Year</option>
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ maxWidth: 220, marginBottom: "1rem" }}>
              <label>Member Type *</label>
              <select value={form.member_type || ""} onChange={e => setForm({ ...form, member_type: e.target.value })}>
                <option value="">Select Type</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Add Member"}</button>
            <button className="btn" onClick={() => setForm(emptyForm)}>Clear</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <button className={`btn ${tab === "all" ? "btn-primary" : ""}`} onClick={() => { setTab("all"); setYearFilter(""); }}>
          All Members
        </button>
        <button className={`btn ${tab === "student" ? "btn-primary" : ""}`} onClick={() => { setTab("student"); setYearFilter(""); }}>
          Students
        </button>
        {tab === "student" && (
          <>
            <span style={{ color: "#bbb", fontSize: 13 }}>|</span>
            {["I Year", "II Year", "III Year", "IV Year"].map(yr => (
              <button key={yr} className={`btn btn-sm ${yearFilter === yr ? "btn-primary" : ""}`} onClick={() => setYearFilter(yearFilter === yr ? "" : yr)} style={{ fontSize: 12 }}>
                {yr}
              </button>
            ))}
          </>
        )}
        <button className={`btn ${tab === "staff" ? "btn-primary" : ""}`} onClick={() => { setTab("staff"); setYearFilter(""); }}>
          Staff Only
        </button>
      </div>

      <div className="card">
        <div className="card-title">
          Member List
          <span style={{ fontSize: 12, fontWeight: 400, color: "#000" }}> {safeMembersList.length} members</span>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : safeMembersList.length === 0 ? (
          <div className="empty">No members found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Roll No.</th><th>Name</th><th>Dept</th><th>Section</th><th>Year</th>
                  <th>Type</th><th>Issued</th><th>Holding</th><th>Returned</th><th>Overdue</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeMembersList.map((m, i) => {
                  const isEditing = editId === m.id;
                  return (
                    <tr key={m.id || i} style={{ background: isEditing ? "#f0f7ff" : "" }}>
                      <td>{i + 1}</td>
                      <td>
                        {isEditing ? (
                          <input style={inputStyle} value={editData.roll_no || ""} onChange={e => setEditData({ ...editData, roll_no: e.target.value })} />
                        ) : (
                          <strong style={{ color: "#1565c0" }}>{m.roll_no || ""}</strong>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input style={inputStyle} value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                        ) : (
                          <strong>{m.name || ""}</strong>
                        )}
                      </td>
                      <td>
                        {isEditing && isAdmin ? (
                          <select style={inputStyle} value={editData.department || "CS"} onChange={e => handleEditDeptChange(e.target.value)}>
                            {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        ) : (
                          <span className="badge badge-blue">{m.department || ""}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select style={inputStyle} value={editData.section || ""} onChange={e => setEditData({ ...editData, section: e.target.value })}>
                            <option value="">-</option>
                            {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className="">{m.section || "-"}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select style={inputStyle} value={editData.year || "I Year"} onChange={e => setEditData({ ...editData, year: e.target.value })}>
                            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        ) : (
                          m.year || ""
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select style={inputStyle} value={editData.member_type || "student"} onChange={e => setEditData({ ...editData, member_type: e.target.value })}>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                          </select>
                        ) : (
                          <span className={`badge ${m.member_type === "staff" ? "badge-purple" : "badge-green"}`}>{m.member_type || "student"}</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{m.total_issued || 0}</td>
                      <td style={{ textAlign: "center" }}>
                        {m.currently_holding > 0 ? <span className="badge badge-amber">{m.currently_holding}</span> : <span style={{ color: "#9aa3b0" }}>—</span>}
                      </td>
                      <td style={{ textAlign: "center", color: "#2e7d32", fontWeight: 600 }}>{m.total_returned || 0}</td>
                      <td style={{ textAlign: "center" }}>
                        {m.overdue_count > 0 ? <span className="badge badge-red">{m.overdue_count}</span> : <span style={{ color: "#9aa3b0" }}>—</span>}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="btn btn-success btn-sm" onClick={saveEdit} disabled={editSaving}>{editSaving ? "Saving..." : "Save"}</button>
                            <button className="btn btn-sm" onClick={cancelEdit}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="btn btn-sm" style={{ background: "#e3f2fd", color: "#000", border: "1px solid #90caf9" }} onClick={() => setViewMemberId(m.id)}>Profile</button>
                            <button className="btn btn-sm" style={{ background: "#fff8e1", color: "#000", border: "1px solid #fde68a" }} onClick={() => startEdit(m)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteMember(m.id, m.name)}>Remove</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}