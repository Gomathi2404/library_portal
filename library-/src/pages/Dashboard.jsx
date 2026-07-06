import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function Dashboard({ dept }) {
  const isAdmin = dept === "admin" || !dept;
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/dashboard.php?dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === "success") { setStats(d.stats); setRecent(d.recent_issues); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dept]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard — {isAdmin ? "All Departments" : dept}</h1>
        <span style={{ fontSize:15, color:"#000" }}>
          {new Date().toLocaleDateString("en-IN", { dateStyle:"full" })}
        </span>
      </div>

      {stats && (
        <>
          <div className="stats-row">
            <div className="stat-card" style={{ borderLeftColor:"#1565c0" }}>
              <div className="stat-label">Total Books</div>
              <div className="stat-value">{stats.total_copies}</div>
              <div className="stat-change">{stats.total_titles} titles</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor:"#2e7d32" }}>
              <div className="stat-label">Available</div>
              <div className="stat-value" style={{ color:"#2e7d32" }}>{stats.available_copies}</div>
              <div className="stat-change up">Ready to issue</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor:"#e65100" }}>
              <div className="stat-label">Issued</div>
              <div className="stat-value" style={{ color:"#e65100" }}>{stats.total_issued}</div>
              <div className="stat-change">{stats.issued_today} issued today</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: stats.overdue>0?"#e53935":"#2e7d32" }}>
              <div className="stat-label">Overdue</div>
              <div className="stat-value" style={{ color:stats.overdue>0?"#e53935":"#2e7d32" }}>
                {stats.overdue}
              </div>
              <div className={`stat-change ${stats.overdue>0?"warn":"up"}`}>
                {stats.overdue>0 ? "Action required" : "All on time"}
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card" style={{ borderLeftColor:"#6a1b9a" }}>
              <div className="stat-label">Total Members</div>
              <div className="stat-value">{stats.total_members}</div>
              <div className="stat-change">Registered</div>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <div className="card-title">Recent Issues — {isAdmin ? "All Departments" : dept}</div>
        {recent.length === 0 ? <div className="empty">No recent issues found.</div> : (
          <table>
            <thead>
              <tr>
                <th>Book ID</th><th>Book Title</th><th>Member</th>
                <th>Roll No.</th><th>Issue Date</th><th>Due Date</th>
                
              </tr>
            </thead>
            <tbody>
              {recent.map((r,i) => (
                <tr key={i}>
                  <td>
                    <span style={{ background:"#d5e9f7", color:"#1565c0", padding:"2px 8px", borderRadius:4, fontSize:12, fontWeight:700 }}>
                      {r.copy_code}
                    </span>
                  </td>
                  <td><strong>{r.book_title}</strong></td>
                  <td style={{ color:"#000", fontWeight:600 }}>{r.member_name}</td>
                  <td style={{ color:"#000", fontWeight:700 }}>{r.roll_no}</td>
                  <td>{r.issue_date}</td>
                  <td style={{ color:"#e65100" }}>{r.due_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}