import { useEffect, useState } from "react";
import AdminAccounts from "./AdminAccounts";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function SuperAdminDashboard({ onViewDept }) {
  const [depts, setDepts]     = useState([]);
  const [stats, setStats]     = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState("departments"); // "departments" | "acco

  useEffect(() => {
    // Load all dept admins
    fetch(`${API}/admin_manage.php`)
      .then(r => r.json())
      .then(async d => {
        if (d.status !== "success") { setLoading(false); return; }
        const admins = d.data;

        // Load stats for each dept in parallel
        const statsMap = {};
        await Promise.all(admins.map(async a => {
          const res = await fetch(`${API}/dashboard.php?dept=${encodeURIComponent(a.department)}`);
          const sd  = await res.json();
          if (sd.status === "success") statsMap[a.department] = sd.stats;
        }));

        setDepts(admins);
        setStats(statsMap);
        setLoading(false);
      });
  }, []);

  if (view === "accounts") {
    return <AdminAccounts onBack={() => setView("departments")} />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Super Admin — Overview</h1>
        
      </div>

      <div className="card" style={{ marginBottom:"1.5rem" }}>
        <div style={{ fontSize:13, color:"#4a5568", lineHeight:1.7 }}>
          You are logged in as <strong>Super Administrator</strong>. 
        </div>
      </div>

      {loading ? <div className="loading">Loading departments...</div> : depts.length === 0 ? (
        <div className="empty">No departments registered yet. </div>
      ) : (
        <div className="dept-grid">
          {depts.map(a => {
            const s = stats[a.department] || {};
            return (
              <div key={a.id} className="dept-card" onClick={() => onViewDept(a.department)}>
                <div className="dept-card-name">{a.department}</div>
                <div className="dept-card-user">Username: {a.username}</div>
                <div className="dept-card-stats">
                  <div className="dept-stat">
                    <strong>{s.total_copies || 0}</strong>
                    Books
                  </div>
                  <div className="dept-stat">
                    <strong>{s.total_members || 0}</strong>
                    Members
                  </div>
                  <div className="dept-stat">
                    <strong style={{ color: s.overdue > 0 ? "#e53935" : "#2e7d32" }}>{s.overdue || 0}</strong>
                    Overdue
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}