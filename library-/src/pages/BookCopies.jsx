import { useEffect, useState } from "react";
import BookHistory from "./BookHistory";
const API = "http://localhost/LIBRARY_PORTAL/library";

const DEPT_OPTIONS = ["CSE","ECE","MECH","AI&DS","IT","Civil","EEE","S&H","MBA","MCA","ICE"];

export default function BookCopies({ dept }) {
  const isAdmin = dept === "admin" || !dept;

  const [copies, setCopies]     = useState([]);
  const [search, setSearch]     = useState("");
  const [orientation, setOrientation] = useState("portrait"); // portrait | landscape
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState(null);

  // Edit state
  const [editId, setEditId]     = useState(null);   // copy_id being edited
  const [editData, setEditData] = useState({});
  const [saving, setSaving]     = useState(false);

  // History view
  const [viewBookId, setViewBookId] = useState(null);

  const fetchCopies = (q = "") => {
    setLoading(true);
    fetch(`${API}/book_copies_list.php?dept=${encodeURIComponent(dept)}&search=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setCopies(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCopies(); }, [dept]);

  // ---- INLINE EDIT ----
  const startEdit = (c) => {
    setEditId(c.copy_id);
    setEditData({
      title:      c.title,
      author:     c.author,
      publisher:  c.publisher || "",
      edition:    c.edition   || "",
      department: c.department
    });
  };

  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const saveEdit = async () => {
    if (!editData.title.trim() || !editData.author.trim()) {
      setMsg({ type:"error", text:"Title and Author are required." }); return;
    }
    setSaving(true); setMsg(null);
    try {
      const res  = await fetch(`${API}/update_copy.php`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ copy_id:editId, ...editData, admin_dept:dept })
      });
      const data = await res.json();
      setMsg({ type:data.status, text:data.message });
      if (data.status === "success") { setEditId(null); setEditData({}); fetchCopies(search); }
    } catch { setMsg({ type:"error", text:"Server error." }); }
    setSaving(false);
    setTimeout(() => setMsg(null), 4000);
  };

  // ---- DELETE COPY ----
  const deleteCopy = (copyId, copyCode, title, bookId) => {
    if (!window.confirm(`Delete "${title}" (Book ID: ${copyCode})?\n\nThis will apply safety archive rules.`)) return;
    
    // Fixed endpoint routing directly to books.php with proper bookId reference mapping
    fetch(`${API}/delete_copy.php?copy_id=${copyId}&dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => {
        setMsg({ type:d.status, text:d.message });
        fetchCopies(search);
        setTimeout(() => setMsg(null), 4000);
      });
  };

  // ---- PRINT ----
  const handlePrint = () => {
    const win = window.open("","_blank","width=1000,height=700");
    const deptNames = {
      CSE: "Department of Computer Science and Engineering (CSE)",
      ECE: "Department of Electronics and Communication Engineering (ECE)",
      EEE: "Department of Electrical and Electronics Engineering (EEE)",
      IT: "Department of Information Technology (IT)",
      MECH: "Department of Mechanical Engineering (MECH)",
      CIVIL: "Department of Civil Engineering (CIVIL)",
      MBA: "Department of Master of Business Administration (MBA)",
      MCA : "Department of Master of Computer Applications (MCA)",
      "AI&DS": "Department of Artificial Intelligence and Data Science (AI&DS)",
      "S&H": "Department of Science and Humanities (S&H)",
      ICE: "Department of Instrumentation and Control Engineering (ICE)"
    };
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Individual Books — ${dept?.toUpperCase()}</title>
      <style>
        @page { size: A4 ${orientation}; margin: 18mm 15mm; }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #000; }
        .hdr { text-align:center; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:14px; }
        .hdr h1 { font-size:15px; }
        .hdr h2 { font-size:12px; margin-top:4px; }
        .hdr p  { font-size:10px; margin-top:4px; }
        table { width:100%; border-collapse:collapse; }
        th { background:#1c2333; color:#fff; padding:6px 8px; font-size:9px; text-align:left; border:1px solid #000; text-transform:uppercase; letter-spacing:0.05em; }
        td { padding:5px 8px; border:1px solid #ccc; font-size:10px; vertical-align:middle; }
        tr:nth-child(even) td { background:#f9f9f9; }
        .avail   { color:#2e7d32; font-weight:700; }
        .issued  { color:#e65100; font-weight:700; }
        .sig { display:flex; justify-content:space-between; margin-top:60px; padding-top:16px; border-top:1px solid #999; }
        .sb  { text-align:center; width:200px; }
        .sl  { border-top:1px solid #000; padding-top:6px; font-size:11px; font-weight:bold; margin-top:48px; }
      </style></head><body>
      <div class="hdr">
        <h1>A.V.C. College of Engineering</h1>
        <h2>Library —  Books  (${isAdmin?"All Departments":deptNames[dept] || dept?.toUpperCase()})</h2>
        <p>Generated: ${new Date().toLocaleDateString("en-IN",{dateStyle:"long"})}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Book ID</th><th>Title</th><th>Author</th>
            <th>Publisher</th><th>Department</th><th>Edition</th>
            <th>Current Holder</th><th>Issue Date</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${copies.map((c,i) => `
            <tr>
              <td>${i+1}</td>
              <td><strong>${c.copy_code}</strong></td>
              <td>${c.title}</td>
              <td>${c.author}</td>
              <td>${c.publisher||"—"}</td>
              <td>${c.department}</td>
              <td>${c.edition||"—"}</td>
              <td>${c.holder_name ? c.holder_name+" ("+c.holder_roll+")" : "—"}</td>
              <td>${c.issue_date||"—"}</td>
              <td class="${c.copy_status==="available"?"avail":"issued"}">
                ${c.copy_status==="available"?"Available":"Issued"}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <p style="margin-top:20px;font-size:20px;color:#000;">Total Books: ${copies.length}</p>
      <div class="sig">
        <div class="sb"><div class="sl">Department Library Incharge</div></div>
        <div class="sb"><div class="sl">HOD</div></div>
      </div>
      </body>
      <div footer style="position:absolute; bottom:10px; width:100%; text-align:center; font-size:9px; color:#000;"> Developed by Department of AI&DS </footer></html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 400);
  };

  if (viewBookId) {
    return <BookHistory bookId={viewBookId} dept={dept} onBack={() => setViewBookId(null)} />;
  }
  const inputStyle = {
    padding:"5px 8px", border:"1px solid #90caf9",
    borderRadius:4, fontSize:12, width:"100%", minWidth:70
  };

  const available = copies.filter(c => c.copy_status === "available").length;
  const issued    = copies.filter(c => c.copy_status === "issued").length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Individual Books — {isAdmin ? "All Departments" : dept?.toUpperCase()}</h1>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div className="search-wrap" style={{ maxWidth:280 }}>
            <span className="search-icon">&#9906;</span>
            <input
              placeholder="Search copy code, title, author..."
              value={search}
              onChange={e => { setSearch(e.target.value); fetchCopies(e.target.value); }}
            />
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button
            className="btn"
            style={{ background: orientation==="portrait" ? "#e3f2fd" : "#fff", color:"#1565c0", border:"1px solid #90caf9", fontSize:12 }}
            onClick={() => setOrientation("portrait")}>
            Portrait Print
          </button>
          <button
            className="btn"
            style={{ background: orientation==="landscape" ? "#e3f2fd" : "#fff", color:"#1565c0", border:"1px solid #90caf9", fontSize:12 }}
            onClick={() => setOrientation("landscape")}>
            Landscape Print
          </button>
          <button className="btn" onClick={handlePrint} disabled={copies.length === 0}>
            Print
          </button>
        </div>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>
          {msg.text}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,auto)", gap:"1rem", marginBottom:"1.25rem", width:"fit-content" }}>
        <div className="stat-card" style={{ borderLeftColor:"#1565c0", padding:"0.9rem 1.2rem" }}>
          <div className="stat-label">Total Books</div>
          <div className="stat-value">{copies.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:"#2e7d32", padding:"0.9rem 1.2rem" }}>
          <div className="stat-label">Available</div>
          <div className="stat-value" style={{ color:"#2e7d32" }}>{available}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:"#e65100", padding:"0.9rem 1.2rem" }}>
          <div className="stat-label">Issued</div>
          <div className="stat-value" style={{ color:"#e65100" }}>{issued}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
        Books With ID
          <span style={{ fontSize:12, fontWeight:400, color:"#000" }}>
            {copies.length} individual Books
          </span>
        </div>

        {loading ? (
          <div className="loading">Loading Books...</div>
        ) : copies.length === 0 ? (
          <div className="empty">No books found.</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Publisher</th>
                  <th>Department</th>
                  <th>Edition</th>
                  <th>Current Holder</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {copies.map((c, i) => {
                  const isEditing = editId === c.copy_id;
                  return (
                    <tr key={c.copy_id} style={{ background: isEditing ? "#f0f7ff" : "" }}>
                      <td style={{ color:"#000", fontSize:12 }}>{i+1}</td>
                      <td>
                        <span style={{
                          background:"#e3f2fd", color:"#1565c0",
                          padding:"3px 10px", borderRadius:4,
                          fontSize:13, fontWeight:700,
                          letterSpacing:"0.04em"
                        }}>
                          {c.copy_code}
                        </span>
                      </td>
                      <td>
                        {isEditing
                          ? <input style={inputStyle} value={editData.title}
                              onChange={e => setEditData({...editData, title:e.target.value})} />
                          : <strong style={{ color:"#1a1a2e" }}>{c.title}</strong>}
                      </td>
                      <td>
                        {isEditing
                          ? <input style={inputStyle} value={editData.author}
                              onChange={e => setEditData({...editData, author:e.target.value})} />
                          : c.author}
                      </td>
                      <td>
                        {isEditing
                          ? <input style={inputStyle} value={editData.publisher}
                              onChange={e => setEditData({...editData, publisher:e.target.value})} />
                          : c.publisher || "—"}
                      </td>
                      <td>
                        {isEditing && isAdmin
                          ? <select style={inputStyle} value={editData.department}
                              onChange={e => setEditData({...editData, department:e.target.value})}>
                              {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          : <span className="badge badge-blue">{c.department}</span>}
                      </td>
                      <td>
                        {isEditing
                          ? <input style={inputStyle} value={editData.edition}
                              onChange={e => setEditData({...editData, edition:e.target.value})} />
                          : c.edition || "—"}
                      </td>
                      <td style={{ fontSize:12 }}>
                        {c.holder_name
                          ? <div>
                              <div style={{ fontWeight:600, color:"#1a1a2e" }}>{c.holder_name}</div>
                              <div style={{ color:"#000" }}>{c.holder_roll}</div>
                            </div>
                          : <span style={{ color:"#9aa3b0" }}>—</span>}
                      </td>
                      <td style={{ color: c.due_date && new Date(c.due_date)<new Date() ? "#e53935" : "#e65100", fontSize:12 }}>
                        {c.due_date || "—"}
                      </td>
                      <td>
                        {c.copy_status === "available"
                          ? <span className="badge badge-green">Available</span>
                          : <span className="badge badge-amber">Issued</span>}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ display:"flex", gap:5 }}>
                            <button className="btn btn-success btn-sm"
                              onClick={saveEdit} disabled={saving}>
                              {saving ? "Saving..." : "Save"}
                            </button>
                            <button className="btn btn-sm" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display:"flex", gap:5 }}>
                            <button className="btn btn-sm"
                              style={{ background:"#e3f2fd", color:"#1565c0", border:"1px solid #90caf9" }}
                              onClick={() => setViewBookId(c.book_id)}>
                              History
                            </button>
                            <button className="btn btn-sm"
                              style={{ background:"#fff8e1", color:"#b45309", border:"1px solid #fde68a" }}
                              onClick={() => startEdit(c)}>
                              Edit
                            </button>
                            {/* Fixed dynamic bookId mapping connection parameters passed into deleteCopy */}
                            <button className="btn btn-danger btn-sm"
                              onClick={() => deleteCopy(c.copy_id, c.copy_code, c.title, c.book_id)}>
                              Delete
                            </button>
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
      <div>
        <button className="btn" onClick={handlePrint} disabled={copies.length === 0}>
          Print
        </button>
      </div>
    </div>
  );
}