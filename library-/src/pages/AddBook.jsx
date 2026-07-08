import { useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
const deptOptions = ["CSE","ECE","MECH","AI&DS","IT","MBA","MCA","Civil","EEE","ICE"];

export default function AddBook({ dept, onSuccess }) {
  const isAdmin = dept === "admin" || !dept;
  const emptyForm = {
    title: "",
    author: "",
    department: isAdmin ? deptOptions[0] : (dept || "CSE"),
    edition: "",
    publisher: "",
    book_code: ""
  };

  const [form, setForm]       = useState(emptyForm);
  const [msg, setMsg]         = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim())     { setMsg({ type:"error", text:"Title is required!" }); return; }
    if (!form.author.trim())    { setMsg({ type:"error", text:"Author is required!" }); return; }
    if (!form.book_code.trim()) { setMsg({ type:"error", text:"Book Code is required!" }); return; }

    setLoading(true);
    setMsg(null);
    try {
      const res  = await fetch(`${API}/books.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setMsg({ type: data.status, text: data.message });
      if (data.status === "success") {
        setForm(emptyForm);
        if (onSuccess) onSuccess();
      }
    } catch {
      setMsg({ type:"error", text:"Server error." });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Book</h1>
      </div>

      {msg && <div className={`alert alert-${msg.type === "success" ? "success" : "error"}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-title">Book Details</div>

        <div className="form-grid">
          <div className="form-group">
            <label>Book Title *</label>
            <input value={form.title} onChange={e => updateField("title", e.target.value)} placeholder="" />
          </div>
          <div className="form-group">
            <label>Author *</label>
            <input value={form.author} onChange={e => updateField("author", e.target.value)} placeholder="" />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Publisher</label>
            <input value={form.publisher} onChange={e => updateField("publisher", e.target.value)} placeholder="" />
          </div>
          <div className="form-group">
            <label>Edition</label>
            <input value={form.edition} onChange={e => updateField("edition", e.target.value)} placeholder="" />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Department *</label>
            {isAdmin ? (
              <select value={form.department} onChange={e => updateField("department", e.target.value)}>
                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input readOnly value={dept} />
            )}
          </div>
          <div className="form-group">
            <label>Book Code *</label>
            <input
              value={form.book_code}
              onChange={e => updateField("book_code", e.target.value.toUpperCase())}
              placeholder=""
              style={{ fontWeight: 700, letterSpacing: "0.05em", fontSize: 15 }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Add Book"}
          </button>
          <button className="btn" onClick={() => { setForm(emptyForm); setMsg(null); }}>Clear</button>
        </div>
      </div>
    </div>
  );
}