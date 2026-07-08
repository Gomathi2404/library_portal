import { useEffect, useState } from "react";
const API = "http://localhost/LIBRARY_PORTAL/library";
export default function Transactions({ dept }) {
  const today    = new Date().toISOString().split("T")[0];
  const monthAgo = new Date(Date.now()-30*86400000).toISOString().split("T")[0];

  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fromDate, setFromDate] = useState(monthAgo);
  const [toDate, setToDate]     = useState(today);
  const [status, setStatus]     = useState("");
  const [count, setCount]       = useState(0);
  const [orientation, setOrientation] = useState("portrait");

  const fetchData = (fd=fromDate, td=toDate, st=status) => {
    setLoading(true);
    const params = new URLSearchParams({ dept, from_date:fd, to_date:td, ...(st?{status:st}:{}) });
    fetch(`${API}/transactions.php?${params}`)
      .then(r => r.json())
      .then(d => { setRows(d.data||[]); setCount(d.count||0); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [dept]);

  // ---- PROFESSIONAL PRINT ----
  const handlePrint = () => {
    const printContent = document.getElementById("print-area").innerHTML;
    const printWindow  = window.open("", "_blank", "width=900,height=700");
    const deptNames = {
      CSE: "Department of Computer Science and Engineering (CSE)",
      ECE: "Department of Electronics and Communication Engineering (ECE)",
      EEE: "Department of Electrical and Electronics Engineering (EEE)",
      IT: "Department of Information Technology (IT)",
      MECH: "Department of Mechanical Engineering (MECH)",
      CIVIL: "Department of Civil Engineering (CIVIL)",
      MBA: "Department of Master of Business Administration (MBA)",
      MCA : "Department of Master of Computer Applications (MCA)",
      "AI&DS": "Department of Artificial Intelligence and Data Science (AI&DS)",
      "S&H": "Department of Science and Humanities (S&H)",
      "ICE": "Department of Instrumentation and Control Engineering (ICE)"
    };
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Report — ${dept?.toUpperCase()}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @page {
            size: A4 ${orientation};
            margin: 18mm 15mm 18mm 15mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #000;
            background: #fff;
          }
          .report-header { text-align: center; margin-bottom: 18px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .report-header h1 { font-size: 16px; font-weight: bold; letter-spacing: 0.04em; }
          .report-header h2 { font-size: 13px; font-weight: 600; margin-top: 4px; }
          .report-header p  { font-size: 10px; color: #333; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th {
            background: #1c2333; color: #fff;
            font-size: 10px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.05em;
            padding: 7px 8px; text-align: left; border: 1px solid #000;
          }
          td { padding: 6px 8px; border: 1px solid #ccc; font-size: 10px; vertical-align: middle; }
          tr:nth-child(even) td { background: #f9f9f9; }
          .badge-issued   { background: #fff8e1; color: #b45309; padding: 2px 7px; border-radius: 3px; font-weight: 600; }
          .badge-returned { background: #f0fdf4; color: #166534; padding: 2px 7px; border-radius: 3px; font-weight: 600; }
          .summary { margin-top: 10px; font-size: 10px; color: #555; }
          .signature-section {
            display: flex; justify-content: space-between;
            margin-top: 60px; padding-top: 16px;
            border-top: 1px solid #999;
          }
          .sig-block { text-align: center; width: 200px; }
          .sig-space { height: 48px; }
          .sig-label { border-top: 1px solid #000; padding-top: 6px; font-size: 11px; font-weight: bold; letter-spacing: 0.03em; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>AVC College of Engineering</h1>
          <h2>Library Transaction Report — ${deptNames[dept] || dept?.toUpperCase()}</h2>
          <p>Period: ${fromDate} to ${toDate}${status ? " | Status: " + status.charAt(0).toUpperCase() + status.slice(1) : " | All Transactions"}</p>
          <p>Generated on: ${new Date().toLocaleDateString("en-IN", { dateStyle:"long" })}</p>
        </div>
        ${printContent}
        <p class="summary">Total Records: ${count}</p>
        <div class="signature-section">
          <div class="sig-block">
            <div class="sig-space"></div>
            <div class="sig-label">Department Library Incharge</div>
          </div>
          <div class="sig-block">
            <div class="sig-space"></div>
            <div class="sig-label">HOD</div>
          </div>
        </div>
      </body>
      <div footer style="position:absolute; bottom:10px; width:100%; text-align:center; font-size:9px; color:#000;">Developed by Department of AI&DS </footer>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 400);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transaction History — {dept?.toUpperCase()}</h1>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button
            className="btn"
            style={{ background: orientation==="portrait" ? "#e3f2fd" : "#fff", color:"#1565c0", border:"1px solid #90caf9", fontSize:12 }}
            onClick={() => setOrientation("portrait")}>
            Portrait
          </button>
          <button
            className="btn"
            style={{ background: orientation==="landscape" ? "#e3f2fd" : "#fff", color:"#1565c0", border:"1px solid #90caf9", fontSize:12 }}
            onClick={() => setOrientation("landscape")}>
            Landscape
          </button>
          <button className="btn" onClick={handlePrint} disabled={rows.length===0}>
            Print Report
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card">
        <div className="card-title">Filter Transactions</div>
        <div className="form-grid">
          <div className="form-group">
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Transactions</option>
              <option value="issued">Issued Only</option>
              <option value="returned">Returned Only</option>
            </select>
          </div>
          <div className="form-group" style={{ justifyContent:"flex-end" }}>
            <label>&nbsp;</label>
            <button className="btn btn-primary" onClick={() => fetchData()}>
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-title">
          Transaction Records
          <span style={{ fontSize:12, fontWeight:400, color:"#000" }}>{count} records</span>
        </div>

        {loading ? <div className="loading">Loading transactions...</div>
        : rows.length === 0 ? <div className="empty">No transactions found for the selected period.</div>
        : (
          <div style={{ overflowX:"auto" }}>
            {/* This div is what gets injected into the print window */}
            <div id="print-area" style={{ display:"none" }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Transaction Date</th>
                    <th>Book Title</th>
                    <th>Book ID</th>
                    <th>Member Name</th>
                    <th>Roll No.</th>
                    
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Fine (Rs.)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,i) => (
                    <tr key={r.id}>
                      <td>{i+1}</td>
                      <td>{r.issue_date}</td>
                      <td>{r.book_title}</td>
                      <td>{r.copy_code}</td>
                      <td>{r.member_name}</td>
                      <td>{r.roll_no}</td>
                      
                      <td>{r.due_date}</td>
                      <td>{r.return_date || "—"}</td>
                      <td>{r.fine > 0 ? `Rs. ${r.fine}` : "—"}</td>
                      <td>{r.status.charAt(0).toUpperCase()+r.status.slice(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Screen Table */}
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Transaction Date</th>
                  <th>Book Title</th>
                  <th>Book ID</th>
                  <th>Member Name</th>
                  <th>Roll No.</th>
                  
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Fine (Rs.)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i) => (
                  <tr key={r.id}>
                    <td>{i+1}</td>
                    <td>{r.issue_date}</td>
                    <td><strong>{r.book_title}</strong></td>
                    <td>
                      <span style={{ background:"#e3f2fd", color:"#1565c0", padding:"2px 7px", borderRadius:4, fontSize:12, fontWeight:700 }}>
                        {r.copy_code}
                      </span>
                    </td>
                    <td>{r.member_name}</td>
                    <td style={{ color:"#1565c0", fontWeight:600 }}>{r.roll_no}</td>
                   
                    <td style={{ color:"#e65100" }}>{r.due_date}</td>
                    <td>{r.return_date || <span style={{ color:"#9aa3b0" }}>—</span>}</td>
                    <td>{r.fine>0 ? <span style={{ color:"#e53935", fontWeight:600 }}>Rs. {r.fine}</span> : "—"}</td>
                    <td>
                      {r.status==="issued"
                        ? <span className="badge badge-amber">Issued</span>
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