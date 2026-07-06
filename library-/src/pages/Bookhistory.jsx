import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";

export default function BookHistory({ bookId, dept, onBack }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("all");

  useEffect(() => {
    fetch(`${API}/book_history.php?book_id=${bookId}&dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [bookId]);

  if (loading) return <div className="loading">Loading book details...</div>;
  if (!data || data.status !== "success") return <div className="empty">Error loading data.</div>;

  const { book, copies, history, stats } = data;
  const shown = tab === "all"      ? history
              : tab === "current"  ? history.filter(h => h.status === "issued")
              :                      history.filter(h => h.status === "returned");

  return (
    <div>
      <div className="page-header">
        <button className="btn" onClick={onBack}>← Back</button>
        <h1 className="page-title">Book Profile</h1>
      </div>

      {/* Book Info Card */}
      <div className="card">
        <div className="card-title">Book Details</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <div>
            <div style={label}>Title</div>
            <div style={value}>{book.title}</div>
          </div>
          <div>
            <div style={label}>Author</div>
            <div style={value}>{book.author}</div>
          </div>
          <div>
            <div style={label}>Publisher</div>
            <div style={value}>{book.publisher || "—"}</div>
          </div>
          <div>
            <div style={label}>Department</div>
            <div style={value}><span >{book.department}</span></div>
          </div>
          <div>
            <div style={label}>Edition</div>
            <div style={value}>{book.edition || "—"}</div>
          </div>
          <div>
            <div style={label}>Book ID</div>
            <div style={value}>{copies && copies.length ? copies[0].copy_code : "—"}</div>
          </div>
          
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card" style={{ borderLeftColor:"#3b5bdb" }}>
          <div className="stat-label">Total Books</div>
          <div className="stat-value">{book.total_copies}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:"#0f9b8e" }}>
          <div className="stat-label">Available Now</div>
          <div className="stat-value" style={{ color:"#0f9b8e" }}>{book.available_copies}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:"#e67e22" }}>
          <div className="stat-label">Currently Issued</div>
          <div className="stat-value" style={{ color:"#e67e22" }}>{book.issued_copies}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor:"#6c5ce7" }}>
          <div className="stat-label">Total Times Borrowed</div>
          <div className="stat-value" style={{ color:"#6c5ce7" }}>{stats.total_borrows}</div>
        </div>
      </div>

      {/* Copies Status */}
      <div className="card">
        <div className="card-title">Book Status</div>
        <table>
          <thead>
            <tr>
              <th>Book ID</th><th>Status</th><th>Current Holder</th>
              <th>Roll No.</th><th>Issue Date</th><th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {copies.map(c => (
              <tr key={c.copy_code}>
                <td><span style={{ background:"#f0f4ff", color:"#3b5bdb", padding:"3px 10px", borderRadius:6, fontWeight:700 }}>{c.copy_code}</span></td>
                <td>
                  {c.status === "available"
                    ? <span className="badge badge-green">Available</span>
                    : c.status === "deleted"
                    ? <span className="badge badge-red">Removed</span>
                    : <span className="badge badge-amber">Issued</span>}
                </td>
                <td>{c.current_holder || "—"}</td>
                <td>{c.holder_roll || "—"}</td>
                <td>{c.issue_date || "—"}</td>
                <td>{c.due_date || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Borrow History */}
      <div className="card">
        <div className="card-title">
           Borrow History
          <div style={{ display:"flex", gap:8 }}>
            {["all","current","returned"].map(t => (
              <button key={t} className={`btn btn-sm ${tab===t?"btn-primary":""}`}
                onClick={() => setTab(t)} style={{ textTransform:"capitalize" }}>
                {t === "all" ? `All (${stats.total_borrows})` : t === "current" ? `Current (${stats.current_holders})` : `Returned (${stats.past_borrows})`}
              </button>
            ))}
          </div>
        </div>
        {shown.length === 0 ? <div className="empty">No records.</div> : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Member</th><th>Roll No.</th><th>Dept</th>
                <th>Book ID</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Fine</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((h, i) => (
                <tr key={h.id}>
                  <td>{i+1}</td>
                  <td><strong>{h.member_name}</strong></td>
                  <td style={{ color:"#0f9b8e", fontWeight:600 }}>{h.roll_no}</td>
                  <td>{h.member_dept}</td>
                  <td><span >{h.copy_code}</span></td>
                  <td>{h.issue_date}</td>
                  <td style={{ color:"#e67e22" }}>{h.due_date}</td>
                  <td>{h.return_date || <span style={{ color:"#bbb" }}>—</span>}</td>
                  <td>{h.fine > 0 ? <span style={{ color:"#e74c3c", fontWeight:600 }}>₹{h.fine}</span> : "—"}</td>
                  <td>
                    {h.status === "issued"
                      ? <span className="badge badge-amber">Issued</span>
                      : <span className="badge badge-green">Returned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const label = { fontSize:11, color:"#888", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 };
const value = { fontSize:14, color:"#1a1a2e", fontWeight:500 };