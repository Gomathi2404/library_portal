import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function Overdue({ dept }) {
  const [overdue, setOverdue]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${API}/issued_books.php?status=issued&dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => {
        setOverdue((d.data || []).filter(i => i.days_late > 0));
        setLoading(false);
      });
  }, [dept]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Overdue </h1>
        {overdue.length > 0 && <span className="badge badge-red" style={{ fontSize:13, padding:"6px 14px" }}>{overdue.length} overdue</span>}
      </div>
      <div className="card">
        {loading ? <div className="loading">Loading...</div> : overdue.length === 0 ? (
          <div className="empty" style={{ color:"#000" }}>No overdue books!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Member</th><th>Roll No.</th><th>Book</th>
                <th>Book ID</th><th>Due Date</th><th>Days Late</th><th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((item, i) => (
                <tr key={item.id}>
                  <td>{i+1}</td>
                  <td>{item.member_name}</td>
                  <td style={{ color:"#0f9b8e", fontWeight:600 }}>{item.roll_no}</td>
                  <td>{item.book_title}</td>
                  <td><span style={{ background:"#f0f4ff", color:"#3b5bdb", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>{item.copy_code}</span></td>
                  <td style={{ color:"#e74c3c" }}>{item.due_date}</td>
                  <td><span style={{ color:"#e74c3c", fontWeight:700 }}>{item.days_late} days</span></td>
                  <td><span style={{ color:"#e74c3c", fontWeight:700 }}>₹{item.fine}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}