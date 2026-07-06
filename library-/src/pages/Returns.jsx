import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function Returns({ dept }) {
  const [issued, setIssued] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]   = useState(null);
  const [search, setSearch] = useState("");

  const fetchIssued = () => {
    setLoading(true);
    fetch(`${API}/issued_books.php?status=issued&dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => { setIssued(d.data || []); setLoading(false); });
  };

  useEffect(() => { fetchIssued(); }, [dept]);

  const handleReturn = async (item) => {
    const today = new Date().toISOString().split("T")[0];
    const fine  = item.fine || 0;
    if (!window.confirm(`Return "${item.book_title}" from ${item.member_name}?\nFine: ₹${fine}`)) return;
    const res  = await fetch(`${API}/issued_books.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_id: item.id, return_date: today, fine })
    });
    const data = await res.json();
    setMsg({ type: data.status, text: data.message });
    fetchIssued();
    setTimeout(() => setMsg(null), 3000);
  };

  const filtered = issued.filter(i =>
    i.member_name.toLowerCase().includes(search.toLowerCase()) ||
    i.roll_no.toLowerCase().includes(search.toLowerCase()) ||
    i.book_title.toLowerCase().includes(search.toLowerCase()) ||
    i.copy_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Returns </h1>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input placeholder="Search member or book..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {msg && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : filtered.length === 0 ? <div className="empty">No active issues found.</div> : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Roll No.</th>
                <th>Book</th>
                <th>Book ID</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Days Late</th>
                <th>Fine (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.member_name}</td>
                  <td style={{ color:"#0f9b8e", fontWeight:600 }}>{item.roll_no}</td>
                  <td>{item.book_title}</td>
                  <td><span style={{ color:"#0f9b8e", fontWeight:800}}>{item.copy_code}</span></td>
                  <td>{item.issue_date}</td>
                  <td>{item.due_date}</td>
                  <td>{item.days_late > 0 ? <span style={{ color:"#e74c3c", fontWeight:600 }}>{item.days_late} days</span> : <span style={{ color:"#0f9b8e" }}>On time</span>}</td>
                  <td>{item.fine > 0 ? <span style={{ color:"#e74c3c", fontWeight:600 }}>₹{item.fine}</span> : "—"}</td>
                  <td><button className="btn btn-primary btn-sm" onClick={() => handleReturn(item)}>Return</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}