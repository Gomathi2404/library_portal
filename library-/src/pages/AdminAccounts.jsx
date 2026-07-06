import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function AdminAccounts({ onBack }) {
  const [admins, setAdmins]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState(null);
  const [editId, setEditId]     = useState(null);
  const [newPass, setNewPass]   = useState("");
  const [saving, setSaving]     = useState(false);

  const fetchAdmins = () => {
    setLoading(true);
    fetch(`${API}/admin_manage.php`)
      .then(r => r.json())
      .then(d => { setAdmins(d.data || []); setLoading(false); });
  };

  useEffect(() => { fetchAdmins(); }, []);

  const resetPassword = async (id) => {
    if (!newPass.trim()) { setMsg({ type:"error", text:"Please enter a new password." }); return; }
    if (newPass.length < 4) { setMsg({ type:"error", text:"Password must be at least 4 characters." }); return; }
    setSaving(true); setMsg(null);
    const res  = await fetch(`${API}/admin_manage.php`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, password:newPass.trim() })
    });
    const data = await res.json();
    setMsg({ type:data.status, text:data.message });
    if (data.status === "success") { setEditId(null); setNewPass(""); fetchAdmins(); }
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  };

  const removeAdmin = (id, dept) => {
    if (!window.confirm(`Remove admin account for ${dept}? This action cannot be undone.`)) return;
    fetch(`${API}/admin_manage.php?id=${id}`, { method:"DELETE" })
      .then(r => r.json())
      .then(d => { setMsg({ type:d.status, text:d.message }); fetchAdmins(); setTimeout(()=>setMsg(null),3000); });
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button className="btn" onClick={onBack}>Back</button>
          <h1 className="page-title">Account Management</h1>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-title">
          Department Admin Accounts
          <span style={{ fontSize:12, fontWeight:400, color:"#000" }}>{admins.length} accounts</span>
        </div>

        {loading ? <div className="loading">Loading accounts...</div>
        : admins.length === 0 ? <div className="empty">No department accounts registered.</div>
        : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Department</th>
                <th>Username</th>
                <th>Reset Password</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => (
                <tr key={a.id}>
                  <td>{i+1}</td>
                  <td><span className="badge badge-blue">{a.department}</span></td>
                  <td><strong>{a.username}</strong></td>
                  <td>
                    {editId === a.id ? (
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <input
                          type="password"
                          value={newPass}
                          onChange={e => setNewPass(e.target.value)}
                          placeholder="New password"
                          style={{ padding:"6px 10px", border:"1px solid #dde1e7", borderRadius:6, fontSize:13, width:160 }}
                        />
                        <button className="btn btn-success btn-sm" onClick={() => resetPassword(a.id)} disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button className="btn btn-sm" onClick={() => { setEditId(null); setNewPass(""); }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-sm"
                        style={{ background:"#fff8e1", color:"#e65100", border:"1px solid #ffe082" }}
                        onClick={() => { setEditId(a.id); setNewPass(""); }}>
                        Reset Password
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeAdmin(a.id, a.department)}>
                      Remove
                    </button>
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