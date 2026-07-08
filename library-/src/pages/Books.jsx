import { useEffect, useState, useRef } from "react";
import BookHistory from "./BookHistory";
import { parseCSV, downloadCSVTemplate } from "../utils/csvParser";
const API = "http://localhost/LIBRARY_PORTAL/library";

const DEPT_OPTIONS = ["CSE","ECE","MECH","AI&DS","IT","Civil","EEE","S&H","MBA","MCA","ICE"];

export default function Books({ dept }) {
  const isAdmin = dept === "admin" || !dept;

  const [books, setBooks]           = useState([]);
  const [search, setSearch]         = useState("");
  const [orientation, setOrientation] = useState("portrait");
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState(null);
  const [viewBookId, setViewBookId] = useState(null);
  const [editId, setEditId]         = useState(null);
  const [editData, setEditData]     = useState({});
  const [saving, setSaving]         = useState(false);
  const [uploadMsg, setUploadMsg]   = useState(null);
  const [uploading, setUploading]   = useState(false);
  const fileRef                     = useRef();

  const fetchBooks = (q="") => {
    setLoading(true);
    fetch(`${API}/books.php?search=${q}&dept=${encodeURIComponent(dept)}`)
      .then(r=>r.json())
      .then(d=>{ setBooks(d.data||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  };

  useEffect(()=>{ fetchBooks(); },[dept]);

  const deleteBook = (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    fetch(`${API}/books.php?id=${id}`,{method:"DELETE"})
      .then(r=>r.json())
      .then(d=>{ setMsg({type:d.status,text:d.message}); fetchBooks(search); setTimeout(()=>setMsg(null),3000); });
  };

  // ---- INLINE EDIT ----
  const startEdit = (b) => {
    setEditId(b.id);
    setEditData({ title:b.title, author:b.author, publisher:b.publisher||"", edition:b.edition||"", department:b.department });
  };

  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const saveEdit = async () => {
    if (!editData.title.trim() || !editData.author.trim()) {
      setMsg({type:"error",text:"Title and Author are required."}); return;
    }
    setSaving(true); setMsg(null);
    try {
      const res  = await fetch(`${API}/update_book.php`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ id:editId, ...editData, admin_dept:dept })
      });
      const data = await res.json();
      setMsg({type:data.status,text:data.message});
      if (data.status==="success") { setEditId(null); setEditData({}); fetchBooks(search); }
    } catch { setMsg({type:"error",text:"Server error."}); }
    setSaving(false);
    setTimeout(()=>setMsg(null),4000);
  };

  // ---- PRINT ----
  const handlePrint = () => {
    const rows  = books;
    const win   = window.open("","_blank","width=900,height=700");
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
      <title>Book Catalogue — ${dept?.toUpperCase()}</title>
      <style>
        @page { size: A4 ${orientation}; margin: 18mm 15mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
        .hdr { text-align:center; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:14px; }
        .hdr h1 { font-size:16px; } .hdr h2 { font-size:13px; margin-top:4px; } .hdr p { font-size:10px; margin-top:4px; }
        table { width:100%; border-collapse:collapse; }
        th { background:#1c2333; color:#fff; padding:7px 8px; font-size:10px; text-align:left; border:1px solid #000; }
        td { padding:6px 8px; border:1px solid #ccc; font-size:10px; }
        tr:nth-child(even) td { background:#f9f9f9; }
        .sig { display:flex; justify-content:space-between; margin-top:60px; padding-top:16px; border-top:1px solid #999; }
        .sb  { text-align:center; width:200px; }
        .sl  { border-top:1px solid #000; padding-top:6px; font-size:11px; font-weight:bold; margin-top:48px; }
      </style></head><body>
      <div class="hdr">
        <h1>AVC College of Engineering</h1>
        <h2>Library Books— ${deptNames[dept] || dept?.toUpperCase()}</h2>
        <p>Generated: ${new Date().toLocaleDateString("en-IN",{dateStyle:"long"})}</p>
      </div>
      <table>
        <thead><tr><th>#</th><th>Title</th><th>Author</th><th>Publisher</th><th>Department</th><th>Edition</th><th>Total Books</th><th>Available</th></tr></thead>
        <tbody>${rows.map((b,i)=>`<tr><td>${i+1}</td><td>${b.title}</td><td>${b.author}</td><td>${b.publisher||"—"}</td><td>${b.department}</td><td>${b.edition||"—"}</td><td style="text-align:center">${b.total_copies}</td><td style="text-align:center">${b.available_copies}</td></tr>`).join("")}</tbody>
      </table>
      <div class="sig"><div class="sb"><div class="sl">Department Library Incharge</div></div><div class="sb"><div class="sl">HOD</div></div></div>
      </body>
      <div footer style="position:absolute; bottom:10px; width:100%; text-align:center; font-size:9px; color:#000;">Developed by Department of AI&DS </footer
      </html>
    `);
    win.document.close();
    setTimeout(()=>{ win.focus(); win.print(); win.close(); },400);
  };

  // ---- EXCEL UPLOAD ----
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); setUploadMsg(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows.length) { setUploadMsg({type:"error",text:"CSV file is empty or invalid."}); setUploading(false); return; }
      const fd = new FormData();
      fd.append("type","books"); fd.append("admin_dept",dept); fd.append("rows",JSON.stringify(rows));
      const res  = await fetch(`${API}/bulk_upload.php`,{method:"POST",body:fd});
      const data = await res.json();
      setUploadMsg({type:data.status,text:data.message+(data.errors?.length?" | "+data.errors.join("; "):"")});
      fetchBooks();
    } catch { setUploadMsg({type:"error",text:"Failed to parse CSV file."}); }
    setUploading(false); fileRef.current.value="";
  };

  const downloadTemplate = () => {
    downloadCSVTemplate("books_template.csv",
      ["title","author","publisher","edition","department","book_code"],
      { title:"", author:"", publisher:"", edition:"", book_code:"" }
    );
  };

  if (viewBookId) return <BookHistory bookId={viewBookId} dept={dept} onBack={()=>setViewBookId(null)} />;

  const inputStyle = { padding:"5px 8px", border:"1px solid #90caf9", borderRadius:4, fontSize:12, width:"100%", minWidth:80 };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Books — {dept?.toUpperCase()}</h1>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <div className="search-wrap" style={{ maxWidth:260 }}>
            <span className="search-icon">&#9906;</span>
            <input placeholder="Search title, author..." value={search}
              onChange={e=>{ setSearch(e.target.value); fetchBooks(e.target.value); }} />
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
          <button className="btn" onClick={handlePrint}>
            Print
          </button>
        </div>
          <button className="btn" onClick={downloadTemplate}
            style={{ background:"#e8f5e9", color:"#000", border:"1px solid #a5d6a7" }}>
           Template Download
          </button>
          <label style={{ cursor:"pointer" }}>
            <input type="file" accept=".csv" ref={fileRef} onChange={handleCSVUpload} style={{ display:"none" }} />
            <span className="btn" style={{ background:"#e3f2fd", color:"#000", border:"1px solid #90caf9" }}>
              {uploading?"Uploading...":" Upload Books"}
            </span>
          </label>
        </div>
      </div>

      {msg       && <div className={`alert alert-${msg.type==="success"?"success":"error"}`}>{msg.text}</div>}
      {uploadMsg && <div className={`alert alert-${uploadMsg.type==="success"?"success":"error"}`}>{uploadMsg.text}</div>}

      <div className="card">
        <div className="card-title">
          Books With Titles
          <span style={{ fontSize:12, fontWeight:400, color:"#000" }}>
            {books.length} titles &nbsp;|&nbsp;
            {books.reduce((s,b)=>s+parseInt(b.total_copies||0),0)} Books
          </span>
        </div>

        {loading ? <div className="loading">Loading...</div>
        : books.length===0 ? <div className="empty">No books found.</div>
        : (
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Title</th><th>Author</th><th>Publisher</th>
                  <th>Department</th><th>Edition</th><th>Total</th><th>Available</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b,i) => {
                  const isEditing = editId === b.id;
                  return (
                    <tr key={b.id} style={{ background: isEditing?"#f0f7ff":"" }}>
                      <td>{i+1}</td>
                      <td>
                        {isEditing
                          ? <input style={inputStyle} value={editData.title} onChange={e=>setEditData({...editData,title:e.target.value})} />
                          : <strong>{b.title}</strong>}
                      </td>
                      <td>
                        {isEditing
                          ? <input style={inputStyle} value={editData.author} onChange={e=>setEditData({...editData,author:e.target.value})} />
                          : b.author}
                      </td>
                      <td>
                        {isEditing
                          ? <input style={inputStyle} value={editData.publisher} onChange={e=>setEditData({...editData,publisher:e.target.value})} />
                          : b.publisher||"—"}
                      </td>
                      <td>
                        {isEditing && isAdmin
                          ? <select style={inputStyle} value={editData.department} onChange={e=>setEditData({...editData,department:e.target.value})}>
                              {DEPT_OPTIONS.map(d=><option key={d} value={d}>{d}</option>)}
                            </select>
                          : <span className="badge badge-blue">{b.department}</span>}
                      </td>
                      <td>
                        {isEditing
                          ? <input style={inputStyle} value={editData.edition} onChange={e=>setEditData({...editData,edition:e.target.value})} />
                          : b.edition||"—"}
                      </td>
                      <td style={{ textAlign:"center", fontWeight:600 }}>{b.total_copies}</td>
                      <td style={{ textAlign:"center", fontWeight:700, color:b.available_copies==0?"#e53935":"#2e7d32" }}>
                        {b.available_copies}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ display:"flex", gap:5 }}>
                            <button className="btn btn-success btn-sm" onClick={saveEdit} disabled={saving}>
                              {saving?"Saving...":"Save"}
                            </button>
                            <button className="btn btn-sm" onClick={cancelEdit}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display:"flex", gap:5 }}>
                            <button className="btn btn-sm"
                              style={{ background:"#e3f2fd", color:"#000", border:"1px solid #90caf9" }}
                              onClick={()=>setViewBookId(b.id)}>
                              History
                            </button>
                            <button className="btn btn-sm"
                              style={{ background:"#fff8e1", color:"#000", border:"1px solid #fde68a" }}
                              onClick={()=>startEdit(b)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={()=>deleteBook(b.id,b.title)}>
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
      <button className="btn" onClick={handlePrint}>
        Print
      </button>
    </div>
  );
}