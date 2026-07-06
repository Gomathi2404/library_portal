import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function StudentDashboard({ student, onLogout }) {
  const [history, setHistory]   = useState([]);
  const [yearSummary, setYearSummary] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("all");

  useEffect(() => {
    fetch(`${API}/member_history.php?member_id=${student.member_id}&dept=${encodeURIComponent(student.department)}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === "success") {
          setHistory(d.history || []);
          setYearSummary(d.year_summary || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [student.member_id]);

  const shown = tab === "all"      ? history
              : tab === "issued"   ? history.filter(h => h.status === "issued")
              :                      history.filter(h => h.status === "returned");

  const totalBorrowed = history.length;
  const currentlyHeld = history.filter(h => h.status === "issued").length;
  const totalReturned = history.filter(h => h.status === "returned").length;
  const overdue       = history.filter(h => h.status === "issued" && new Date(h.due_date) < new Date()).length;
  const totalFine     = history.reduce((s, h) => s + parseFloat(h.fine || 0), 0);

  const getStatus = (h) => {
    if (h.status === "returned") return <span className="badge badge-green">Returned</span>;
    if (new Date(h.due_date) < new Date()) return <span className="badge badge-red">Overdue</span>;
    return <span className="badge badge-amber">Issued</span>;
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f4f5f7" }}>

      {/* Top bar */}
      <div style={{ background:"#1c2333", padding:"0 2rem", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>
          Library Management System
          <span style={{ fontSize:11, color:"rgba(22, 2, 2, 0.45)", fontWeight:400, marginLeft:10 }}>
            AVC College of Engineering — Student Portal
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>{student.name}</span>
          <button className="btn btn-sm"
            style={{ background:"rgba(255,255,255,0.08)", color:"#ef9a9a", border:"1px solid rgba(239,154,154,0.3)", fontSize:12 }}
            onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem" }}>

        {/* Profile Card */}
        <div className="card" style={{ marginBottom:"1.5rem" }}>
          <div className="card-title">Student Profile</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.25rem" }}>
            <div><div style={lbl}>Name</div><div style={val}>{student.name}</div></div>
            <div><div style={lbl}>Registration Number</div><div style={{ ...val, color:"#1565c0", fontWeight:700, fontSize:16 }}>{student.roll_no}</div></div>
            <div><div style={lbl}>Department</div><div style={val}><span className="badge badge-blue">{student.department}</span></div></div>
            <div><div style={lbl}>Section</div><div style={val}><span className="badge badge-blue">{student.section || "-"}</span></div></div>
            <div>
              <div style={lbl}>Current Academic Year</div>
              <div style={val}>{student.year}</div>
            </div>
            
            <div><div style={lbl}>Member Type</div><div style={val}><span className="badge badge-green">{student.member_type}</span></div></div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row" style={{ marginBottom:"1.5rem" }}>
          <div className="stat-card" style={{ borderLeftColor:"#6a1b9a" }}>
            <div className="stat-label">Total Borrowed</div>
            <div className="stat-value" style={{ color:"#6a1b9a" }}>{totalBorrowed}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor:"#e65100" }}>
            <div className="stat-label">Currently Holding</div>
            <div className="stat-value" style={{ color:"#e65100" }}>{currentlyHeld}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor:"#2e7d32" }}>
            <div className="stat-label">Total Returned</div>
            <div className="stat-value" style={{ color:"#2e7d32" }}>{totalReturned}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: overdue>0?"#e53935":"#2e7d32" }}>
            <div className="stat-label">Overdue Books</div>
            <div className="stat-value" style={{ color:overdue>0?"#e53935":"#2e7d32" }}>{overdue}</div>
            {totalFine > 0 && <div className="stat-change warn">Fine: Rs. {totalFine}</div>}
          </div>
        </div>

        {/* Year-wise summary */}
        {yearSummary.length > 1 && (
          <div className="card" style={{ marginBottom:"1.5rem" }}>
            <div className="card-title">Activity by Academic Year</div>
            <div style={{ background:"#f8f9ff", border:"1px solid #e8ecff", borderRadius:6, padding:"8px 12px", fontSize:12, color:"#4a5568", marginBottom:"1rem" }}>
              Your borrowing history is organized by the academic year you were enrolled in at the time of each transaction. Updating your year profile does not alter past records.
            </div>
            <table>
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Books Borrowed</th>
                  <th>Returned</th>
                  <th>Still Holding</th>
                </tr>
              </thead>
              <tbody>
                {yearSummary.map(y => (
                  <tr key={y.year}>
                    <td><strong>{y.year}</strong></td>
                    <td style={{ textAlign:"center", fontWeight:700 }}>{y.total}</td>
                    <td style={{ textAlign:"center", color:"#2e7d32", fontWeight:600 }}>{y.returned}</td>
                    <td style={{ textAlign:"center" }}>
                      {y.issued>0
                        ? <span className="badge badge-amber">{y.issued}</span>
                        : <span style={{ color:"#9aa3b0" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transaction History */}
        <div className="card">
          <div className="card-title">
            Book Transaction History
            <div style={{ display:"flex", gap:8 }}>
              {[
                {id:"all",      label:`All (${totalBorrowed})`},
                {id:"issued",   label:`Active (${currentlyHeld})`},
                {id:"returned", label:`Returned (${totalReturned})`}
              ].map(t => (
                <button key={t.id} className={`btn btn-sm ${tab===t.id?"btn-primary":""}`}
                  onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? <div className="loading">Loading history...</div>
          : shown.length === 0 ? <div className="empty">No transactions found.</div>
          : (
            <div style={{ overflowX:"auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Copy Code</th>
                    <th>Year at Time of Borrowing</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Fine (Rs.)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((h, i) => (
                    <tr key={h.id}>
                      <td>{i+1}</td>
                      <td><strong>{h.book_title}</strong></td>
                      <td>{h.author}</td>
                      <td>
                        <span style={{ background:"#e3f2fd", color:"#1565c0", padding:"2px 7px", borderRadius:4, fontSize:12, fontWeight:700 }}>
                          {h.copy_code}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-blue">{h.year_at_issue}</span>
                      </td>
                      <td>{h.issue_date}</td>
                      <td style={{ color: new Date(h.due_date)<new Date()&&h.status==="issued"?"#e53935":"#e65100" }}>
                        {h.due_date}
                      </td>
                      <td>{h.return_date || <span style={{ color:"#9aa3b0" }}>—</span>}</td>
                      <td>{h.fine>0 ? <span style={{ color:"#e53935", fontWeight:600 }}>Rs. {h.fine}</span> : "—"}</td>
                      <td>{getStatus(h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop:"1rem", padding:"8px 12px", background:"#f8f9fa", border:"1px solid #edf0f4", borderRadius:6, fontSize:11, color:"#000" }}>
            This is a read-only view. Contact your department library admin for any corrections or queries.
          </div>
        </div>
      </div>
    </div>
  );
}

const lbl = { fontSize:11, color:"#000", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 };
const val = { fontSize:14, color:"#1a1a2e", fontWeight:500 };