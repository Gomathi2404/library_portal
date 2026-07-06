import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function PromoteStudents({ dept }) {
  const isAdmin = dept === "admin" || !dept;

  const [preview, setPreview]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [loadingPreview, setLP]       = useState(true);
  const [confirmed, setConfirmed]     = useState(false);
  const [promoting, setPromoting]     = useState(false);
  const [result, setResult]           = useState(null);
  const [log, setLog]                 = useState([]);
  const [history, setHistory]         = useState([]);
  const [loadingLog, setLoadingLog]   = useState(true);

  const fetchPreview = () => {
    setLP(true);
    fetch(`${API}/promote_students.php?dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === "success") { setPreview(d.preview||[]); setTotal(d.total||0); }
        setLP(false);
      })
      .catch(() => setLP(false));
  };

  const fetchLog = () => {
    setLoadingLog(true);
    fetch(`${API}/promotion_log.php?dept=${encodeURIComponent(dept)}`)
      .then(r => r.json())
      .then(d => { setHistory(d.data||[]); setLoadingLog(false); })
      .catch(() => setLoadingLog(false));
  };

  useEffect(() => { fetchPreview(); fetchLog(); }, [dept]);

  const handlePromote = async () => {
    if (!confirmed) {
      setResult({ type:"error", text:"Please check the confirmation box before proceeding." });
      return;
    }
    setPromoting(true); setResult(null); setLog([]);
    try {
      const res  = await fetch(`${API}/promote_students.php`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ admin_dept:dept, confirm:true })
      });
      const data = await res.json();
      setResult({ type:data.status, text:data.message });
      if (data.status === "success") {
        setLog(data.log||[]);
        setConfirmed(false);
        fetchPreview();
        fetchLog();
      }
    } catch { setResult({ type:"error", text:"Server error." }); }
    setPromoting(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Promote Students to Next Year</h1>
      </div>

      

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem", marginBottom:"1.25rem" }}>

        {/* Preview */}
        <div className="card">
          <div className="card-title">
            Promotion Preview
            <span style={{ fontSize:12, fontWeight:400, color:"#000" }}>
              {isAdmin ? "All Departments" : dept?.toUpperCase()}
            </span>
          </div>
          {loadingPreview ? <div className="loading">Loading...</div>
          : preview.length === 0 ? <div className="empty">No eligible students .</div>
          : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Current Year</th>
                    <th>Promotes To</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p,i) => (
                    <tr key={i}>
                      <td><span className="badge badge-amber">{p.from}</span></td>
                      <td><span className="badge badge-green">{p.to}</span></td>
                      <td style={{ textAlign:"center", fontWeight:700, fontSize:16 }}>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{
                marginTop:"1rem", padding:"8px 12px",
                background:"#ddf3f6", border:"1px solid #a7f3d0",
                borderRadius:6, fontSize:13, color:"#000", fontWeight:600
              }}>
                Total students to be promoted: {total}
              </div>
            </>
          )}
        </div>

        {/* Action */}
        <div className="card">
          <div className="card-title">Execute Promotion</div>

          {result && (
            <div className={`alert alert-${result.type === "success" ? "success" : "error"}`}>
              {result.text}
            </div>
          )}

          {log.length > 0 && (
            <div style={{
              background:"#f8f9fa", border:"1px solid #edf0f4",
              borderRadius:6, padding:"10px 12px", marginBottom:"1rem",
              fontFamily:"monospace", fontSize:12, color:"#000", lineHeight:2
            }}>
              {log.map((l,i) => <div key={i}>{l}</div>)}
            </div>
          )}

          {/* Warning */}
          <div style={{
            background:"#fff8e1", border:"1px solid #fde68a",
            borderRadius:8, padding:"1rem", marginBottom:"1rem"
          }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8, color:"#000" }}>
              Before You Proceed
            </div>
            <ul style={{ fontSize:12, color:"#000", paddingLeft:"1.2rem", lineHeight:2 }}>
              <li>This will affect <strong>{total}</strong> student profile(s)</li>
              <li>4th Year students will be moved to <strong>Alumni</strong></li>
              <li>Faculty / staff members are <strong>not affected</strong></li>
              <li>Library history will remain <strong>completely unchanged</strong></li>
              <li>This action cannot be automatically reversed</li>
            </ul>
          </div>

          {/* Confirm checkbox */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:"1.25rem" }}>
            <input
              type="checkbox"
              id="confirm-promo"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              style={{ marginTop:3, width:16, height:16, cursor:"pointer" }}
            />
            <label htmlFor="confirm-promo"
              style={{ fontSize:13, color:"#000", cursor:"pointer", lineHeight:1.6 }}>
              I confirm that I want to promote all eligible students to their next academic year.
              I understand that only the student profile year field will be updated and no library
              transaction history will be affected.
            </label>
          </div>

          {/* THE BUTTON */}
          <button
            className="btn btn-primary"
            onClick={handlePromote}
            disabled={promoting || total === 0}
            style={{ width:"100%", padding:12, fontSize:14, fontWeight:700 }}>
            {promoting
              ? "Promoting Students..."
              : `Promote All Students to Next Year (${total})`}
          </button>

          {total === 0 && !loadingPreview && (
            <p style={{ textAlign:"center", fontSize:12, color:"#000", marginTop:10 }}>
              No eligible students found for promotion.
            </p>
          )}
        </div>
      </div>

      

      {/* Promotion History */}
      <div className="card">
        <div className="card-title">Promotion History </div>
        {loadingLog ? <div className="loading">Loading...</div>
        : history.length === 0 ? <div className="empty">No promotion events recorded yet.</div>
        : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Date and Time</th><th>Department</th>
                <th>Students Promoted</th><th>Details</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h,i) => (
                <tr key={h.id}>
                  <td>{i+1}</td>
                  <td>{h.promoted_at}</td>
                  <td><span className="badge badge-blue">{h.department}</span></td>
                  <td style={{ textAlign:"center", fontWeight:700 }}>{h.total_promoted}</td>
                  <td style={{ fontSize:11, color:"#000" }}>{h.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const code = {
  background:"#f0f1f3", padding:"2px 6px",
  borderRadius:3, fontFamily:"monospace", fontSize:11
};