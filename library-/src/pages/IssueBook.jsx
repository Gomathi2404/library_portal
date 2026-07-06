import { useEffect, useState, useRef } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function IssueBook({ dept }) {
  const isAdmin = dept === "admin" || !dept;

  const [members, setMembers]             = useState([]);
  const [memberSearch, setMemberSearch]   = useState("");
  const [filteredMembers, setFiltered]    = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDrop, setShowDrop]           = useState(false);

  const [bookCode, setBookCode]   = useState("");
  const [bookInfo, setBookInfo]   = useState(null);
  const [bookError, setBookError] = useState("");
  const [bookLoading, setBookLoading] = useState(false);
  const bookTimer = useRef(null);

  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate]     = useState(new Date(Date.now()+14*86400000).toISOString().split("T")[0]);

  const [msg, setMsg]         = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/members.php?dept=${encodeURIComponent(dept)}`)
      .then(r=>r.json()).then(d=>setMembers(d.data||[]));
  }, [dept]);

  const handleMemberSearch = e => {
    const val = e.target.value;
    setMemberSearch(val); setSelectedMember(null);
    if (!val.trim()) { setFiltered([]); setShowDrop(false); return; }
    setFiltered(members.filter(m =>
      m.roll_no.toLowerCase().includes(val.toLowerCase()) ||
      m.name.toLowerCase().includes(val.toLowerCase())
    ));
    setShowDrop(true);
  };

  const pickMember = m => {
    setSelectedMember(m);
    setMemberSearch(`${m.roll_no} — ${m.name}`);
    setShowDrop(false);
  };

  const handleBookCode = e => {
    const val = e.target.value.toUpperCase();
    setBookCode(val); setBookInfo(null); setBookError("");
    clearTimeout(bookTimer.current);
    if (!val.trim()) return;
    bookTimer.current = setTimeout(() => fetchBook(val.trim()), 500);
  };

  const fetchBook = async code => {
    setBookLoading(true); setBookInfo(null); setBookError("");
    try {
      const res  = await fetch(`${API}/get_copy.php?code=${encodeURIComponent(code)}&dept=${encodeURIComponent(dept)}`);
      const data = await res.json();
      if (data.status === "success") {
        // Guard: Check if master book is archived from backend response
        if (data.data && (data.data.book_status === "archived" || data.data.status === "archived")) {
          setBookError("This book has been deleted or archived. Cannot issue!");
        } else {
          setBookInfo(data.data);
        }
      } else {
        setBookError(data.message);
      }
    } catch { setBookError("Server error."); }
    setBookLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedMember) { setMsg({ type:"error", text:"Please select a member!" }); return; }
    if (!bookInfo)        { setMsg({ type:"error", text:"Please enter a valid Book ID!" }); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API}/issued_books.php`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          member_id:  selectedMember.id,
          copy_code:  bookInfo.copy_code,
          issue_date: issueDate,
          due_date:   dueDate,
          admin_dept: dept
        })
      });
      const data = await res.json();
      setMsg({ type:data.status, text:data.message });
      if (data.status === "success") {
        setSelectedMember(null); setMemberSearch("");
        setBookCode(""); setBookInfo(null); setBookError("");
        fetch(`${API}/members.php?dept=${encodeURIComponent(dept)}`).then(r=>r.json()).then(d=>setMembers(d.data||[]));
      }
    } catch { setMsg({ type:"error", text:"Server error." }); }
    setLoading(false);
    setTimeout(()=>setMsg(null), 4000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Issue Book — {dept?.toUpperCase()}</h1>
      </div>

      {msg && <div className={`alert alert-${msg.type==="success"?"success":"error"}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-title">Issue Details</div>

        <div className="form-grid" style={{ marginBottom:"1rem" }}>
          <div className="form-group">
            <label>Department (Auto-filled)</label>
            <input readOnly value={isAdmin ? "All Departments (Admin)" : dept}
              style={{ background:"#f0fffe", fontWeight:700, color:"#454d4b", border:"1px solid #b2eadf" }} />
          </div>
        </div>

        {/* Member Search */}
        <div className="form-grid">
          <div className="form-group" style={{ position:"relative" }}>
            <label>Search Member (Roll No. or Name) *</label>
            <input value={memberSearch} onChange={handleMemberSearch} autoComplete="off" />
            {showDrop && (
              <div style={dropStyle}>
                {filteredMembers.length===0
                  ? <div style={dropItem}>No member found</div>
                  : filteredMembers.map(m=>(
                    <div key={m.id} style={dropItem}
                      onMouseEnter={e=>e.currentTarget.style.background="#f0fffe"}
                      onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                      onClick={()=>pickMember(m)}>
                      <strong style={{ color:"#0f9b8e" }}>{m.roll_no}</strong> — {m.name}
                      <span style={{ fontSize:11, color:"#999", marginLeft:8 }}>{m.department} | {m.year}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Member Info</label>
            <input readOnly value={selectedMember?`${selectedMember.name} | ${selectedMember.department} | ${selectedMember.year}`:""}
              placeholder="Auto-filled after selection" />
          </div>
        </div>

        {/* Book ID */}
        <div className="form-grid">
          <div className="form-group">
            <label>Book ID *</label>
            <input value={bookCode} onChange={handleBookCode}
              placeholder=" "
              autoComplete="off"
              style={{ fontWeight:700, letterSpacing:"0.05em", fontSize:15 }} />
            {bookLoading && <span style={{ fontSize:12, color:"#888", marginTop:4 }}>🔍 Fetching...</span>}
            {bookError  && <span style={{ fontSize:12, color:"#e74c3c", fontWeight:600, marginTop:4 }}> {bookError}</span>}
          </div>
          <div className="form-group">
            <label>Book Info</label>
            <input readOnly value={bookInfo?`${bookInfo.title} | ${bookInfo.author} | ${bookInfo.department}`:""}
              placeholder="Auto-filled when valid ID entered" />
            {bookInfo && <span style={{ fontSize:12, color:"#0f9b8e", fontWeight:600, marginTop:4 }}> Available — {bookInfo.available_copies} of {bookInfo.total_copies} copies free</span>}
          </div>
        </div>

        {/* Dates */}
        <div className="form-grid">
          <div className="form-group">
            <label>Issue Date</label>
            <input type="date" value={issueDate} onChange={e=>setIssueDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Due Date (14 days)</label>
            <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        {selectedMember && bookInfo && (
          <div style={{ background:"#f0fffe", border:"1px solid #b2eadf", borderRadius:10, padding:"1rem", marginBottom:"1rem" }}>
            <div style={{ fontWeight:700, color:"#021110", marginBottom:8 }}>Issue Summary</div>
            <div style={{ fontSize:13, color:"#333", lineHeight:2.2 }}>
              Department: <strong style={{ color:"#0f9b8e" }}>{isAdmin?"Admin":dept}</strong><br/>
               <strong>{selectedMember.name}</strong> | Roll: <strong style={{ color:"#0f9b8e" }}>{selectedMember.roll_no}</strong><br/>
               <strong>{bookInfo.title}</strong> | {bookInfo.author}<br/>
               Book ID: <strong style={{ color:"#3b5bdb", fontSize:15 }}>{bookInfo.copy_code}</strong><br/>
               Issue: <strong>{issueDate}</strong> → Due: <strong style={{ color:"#e67e22" }}>{dueDate}</strong>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading?"Issuing...":"Issue Book"}
          </button>
          <button className="btn" onClick={()=>{
            setSelectedMember(null); setMemberSearch("");
            setBookCode(""); setBookInfo(null); setBookError(""); setMsg(null);
          }}>Clear</button>
        </div>
      </div>
    </div>
  );
}

const dropStyle = { position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1px solid #ddd", borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.12)", zIndex:100, maxHeight:220, overflowY:"auto", marginTop:2 };
const dropItem  = { padding:"10px 14px", cursor:"pointer", fontSize:13, borderBottom:"1px solid #f5f5f5", background:"#fff" };