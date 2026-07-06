import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function MemberProfile({ memberId, dept, onBack }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("all");

  useEffect(() => {
    fetch(`${API}/member_history.php?member_id=${memberId}&dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [memberId]);

  if (loading) return <div className="loading">Loading member profile...</div>;
  if (!data || data.status !== "success") return <div className="empty">Error loading profile.</div>;

  const { member, stats, year_summary } = data;
  const shown = tab === "all"      ? data.history
              : tab === "current"  ? data.current
              :                      data.returned;

  return (
    <div>
      <div className="page-header">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button className="btn" onClick={onBack}>Back</button>
          <h1 className="page-title">Member Profile</h1>
        </div>
      </div>

      {/* Member Details */}
      <div className="card">
        <div className="card-title">Member Details</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"1rem" }}>
          <div><div style={lbl}>Name</div><div style={val}><strong>{member.name}</strong></div></div>
          <div><div style={lbl}>Roll No.</div><div style={{ ...val, color:"#1565c0", fontWeight:700 }}>{member.roll_no}</div></div>
          <div><div style={lbl}>Department</div><div style={val}>{member.department}</div></div>
          <div><div style={lbl}>Section</div><div style={val}>{member.section || "-"}</div></div>
          <div>
            <div style={lbl}>Current Year</div>
            <div style={val}>
              {member.year}
                <span style={{ fontSize:11, color:"#000", marginLeft:6 }}>(live profile)</span>
            </div>
          </div>
          
          <div><div style={lbl}>Type</div><div style={val}><span className={`badge ${member.member_type==="staff"?"badge-purple":"badge-green"}`}>{member.member_type}</span></div></div>
          <div><div style={lbl}>Member Since</div><div style={val}>{member.created_at?.split(" ")[0]||"—"}</div></div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card" style={{ borderLeftColor:"#6a1b9a" }}>
          <div className="stat-label">Total Borrowed</div>
          <div className="stat-value" style={{ color:"#6a1b9a" }}>{stats.total_borrowed}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:"#e65100" }}>
          <div className="stat-label">Currently Holding</div>
          <div className="stat-value" style={{ color:"#e65100" }}>{stats.currently_holding}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:"#2e7d32" }}>
          <div className="stat-label">Total Returned</div>
          <div className="stat-value" style={{ color:"#2e7d32" }}>{stats.total_returned}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: stats.total_fine>0?"#e53935":"#2e7d32" }}>
          <div className="stat-label">Total Fine</div>
          <div className="stat-value" style={{ color:stats.total_fine>0?"#e53935":"#2e7d32" }}>
            Rs. {stats.total_fine}
          </div>
        </div>
      </div>

      {/* Year-wise Summary */}
      {year_summary && year_summary.length > 0 && (
        <div className="card">
          <div className="card-title">Activity by Academic Year</div>
          <table>
            <thead>
              <tr>
                <th>Academic Year at Time of Borrowing</th>
                <th>Total Borrowed</th>
                <th>Returned</th>
                <th>Currently Held</th>
              </tr>
            </thead>
            <tbody>
              {year_summary.map(y => (
                <tr key={y.year}>
                  <td><strong>{y.year}</strong></td>
                  <td style={{ textAlign:"center", fontWeight:700 }}>{y.total}</td>
                  <td style={{ textAlign:"center", color:"#2e7d32", fontWeight:600 }}>{y.returned}</td>
                  <td style={{ textAlign:"center" }}>
                    {y.issued > 0
                      ? <span className="badge badge-amber">{y.issued}</span>
                      : <span style={{ color:"#9aa3b0" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Currently Holding */}
      {data.current.length > 0 && (
        <div className="card">
          <div className="card-title">Currently Holding</div>
          <table>
            <thead>
              <tr>
                <th>Book Title</th><th>Author</th><th>Book ID</th>
                <th>Year Borrowed In</th><th>Issue Date</th><th>Due Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.current.map(h => (
                <tr key={h.id}>
                  <td><strong>{h.book_title}</strong></td>
                  <td>{h.author}</td>
                  <td><span style={codeStyle}>{h.copy_code}</span></td>
                  <td>
                    <span >{h.year_at_issue}</span>
                  </td>
                  <td>{h.issue_date}</td>
                  <td style={{ color: new Date(h.due_date)<new Date()?"#e53935":"#e65100" }}>{h.due_date}</td>
                  <td>
                    {new Date(h.due_date) < new Date()
                      ? <span className="badge badge-red">Overdue</span>
                      : <span className="badge badge-amber">Issued</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full History */}
      <div className="card">
        <div className="card-title">
          Complete Borrowing History
          <div style={{ display:"flex", gap:8 }}>
            {[
              {id:"all",      label:`All (${stats.total_borrowed})`},
              {id:"current",  label:`Holding (${stats.currently_holding})`},
              {id:"returned", label:`Returned (${stats.total_returned})`}
            ].map(t => (
              <button key={t.id} className={`btn btn-sm ${tab===t.id?"btn-primary":""}`}
                onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? <div className="empty">No records found.</div> : (
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Book ID</th>
                  <th>Year at Time of Issue</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Fine</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((h, i) => (
                  <tr key={h.id}>
                    <td>{i+1}</td>
                    <td><strong>{h.book_title}</strong></td>
                    <td>{h.author}</td>
                    <td><span style={codeStyle}>{h.copy_code}</span></td>
                    <td>
                      <span >{h.year_at_issue}</span>
                    </td>
                    <td>{h.issue_date}</td>
                    <td style={{ color:"#e65100" }}>{h.due_date}</td>
                    <td>{h.return_date || <span style={{ color:"#9aa3b0" }}>—</span>}</td>
                    <td>{h.fine>0 ? <span style={{ color:"#e53935", fontWeight:600 }}>Rs. {h.fine}</span> : "—"}</td>
                    <td>
                      {h.status==="issued"
                        ? (new Date(h.due_date)<new Date()
                            ? <span className="badge badge-red">Overdue</span>
                            : <span className="badge badge-amber">Issued</span>)
                        : <span className="badge badge-green">Returned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const lbl      = { fontSize:11, color:"#000", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 };
const val      = { fontSize:14, color:"#1a1a2e", fontWeight:500 };
const codeStyle = { background:"#e3f2fd", color:"#1565c0", padding:"2px 7px", borderRadius:4, fontSize:12, fontWeight:700 };