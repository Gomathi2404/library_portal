import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  {
    key: "catalogue",
    label: "Book Details",
    icon: "ti-books",
    items: [
      { id: "books", label: "Books Titles", icon: "ti-book" },
      { id: "bookcopies", label: "Books List", icon: "ti-copy" },
      { id: "addbook", label: "Add Book", icon: "ti-plus" },
    ],
  },
  {
    key: "circulation",
    label: "Circulation",
    icon: "ti-arrow-left-right",
    items: [
      { id: "issue", label: "Issue Book", icon: "ti-hand-stop" },
      { id: "returns", label: "Returns", icon: "ti-refresh" },
      { id: "overdue", label: "Overdue", icon: "ti-clock" },
    ],
  },
  {
    key: "members",
    label: "Members",
    icon: "ti-users",
    items: [
      { id: "members", label: "Members", icon: "ti-user" },
      { id: "addmember", label: "Add Member", icon: "ti-user-plus" },
      { id: "deletestudent", label: "Delete Student", icon: "ti-user-x" },
    ],
  },
];

const COLORS = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  sidebarBg: "#0f172a",
  border: "rgba(148, 163, 184, 0.12)",
  textMain: "#f1f5f9",
  textMuted: "#94a3b8",
  textSecondary: "rgba(241, 245, 249, 0.6)",
  accentRed: "#ef4444",
  accentRedLight: "rgba(239, 68, 68, 0.1)",
};

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
const TRANSITION = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

function AccordionSection({ sec, expanded, onToggle, currentPage, onNavigate }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(expanded ? contentRef.current.scrollHeight : 0);
    }
  }, [expanded]);

  const isActive = sec.items.some((i) => i.id === currentPage);

  return (
    <div style={{ marginBottom: "0px" }}>
      <button
        onClick={() => onToggle(sec.key)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "12px",
          width: "100%",
          padding: "12px 1.5rem",
          margin: "0 0.75rem 0",
          fontSize: "12px",
          fontWeight: 700,
          color: expanded ? COLORS.textMain : isActive ? COLORS.primary : COLORS.textMuted,
          cursor: "pointer",
          background: "none",
          border: "none",
          fontFamily: FONT,
          transition: TRANSITION,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        <i
          className={`ti ${sec.icon}`}
          style={{
            fontSize: "20px",
            opacity: expanded || isActive ? 1 : 0.6,
            transition: TRANSITION,
          }}
        />
        <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>{sec.label}</span>
        <i
          className="ti ti-chevron-right"
          style={{
            fontSize: "12px",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            opacity: 0.3,
          }}
        />
      </button>

      <div
        style={{
          overflow: "hidden",
          height: `${height}px`,
          transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: "6px" }}>
          {sec.items.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 1.5rem 10px 3.25rem",
                fontSize: "13px",
                fontWeight: currentPage === item.id ? 600 : 500,
                color: currentPage === item.id ? COLORS.primary : COLORS.textSecondary,
                cursor: "pointer",
                transition: TRANSITION,
                fontFamily: FONT,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.textMain;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  currentPage === item.id ? COLORS.primary : COLORS.textSecondary;
              }}
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  currentPage = "dashboard",
  onNavigate = () => {},
  onLogout = () => {},
  dept = "admin",
  username = "Administrator",
}) {
  const isAdmin = dept === "admin" || !dept;
  const findSection = (page) => SECTIONS.find((s) => s.items.some((i) => i.id === page))?.key || null;
  const [expanded, setExpanded] = useState(() => {
    const init = {};
    SECTIONS.forEach((s) => {
      init[s.key] = findSection(currentPage) === s.key;
    });
    return init;
  });

  useEffect(() => {
    const sec = findSection(currentPage);
    if (sec) setExpanded((prev) => ({ ...prev, [sec]: true }));
  }, [currentPage]);

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "280px",
          minWidth: "280px",
          background: COLORS.sidebarBg,
          borderRight: `1px solid ${COLORS.border}`,
          fontFamily: FONT,
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Branding Spotlight ── */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            left: 0,
            width: "100%",
            height: "200px",
            background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── Polished Glass Branding ── */}
        <div
          style={{
            padding: "2rem 1.25rem",
            borderBottom: `1px solid ${COLORS.border}`,
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: "rgba(241, 245, 249, 0.06)",
              border: "1px solid rgba(241, 245, 249, 0.12)",
              borderRadius: "16px",
              padding: "16px 20px",
              backdropFilter: "blur(16px)",
              position: "relative",
              overflow: "hidden",
              boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(99, 102, 241, 0.1)`,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              transform: "perspective(1200px) rotateX(0.5deg) rotateY(-0.5deg)",
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              const rotX = (y - 0.5) * 3;
              const rotY = (x - 0.5) * 3;
              e.currentTarget.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1200px) rotateX(0.5deg) rotateY(-0.5deg)";
            }}
          >
            {/* Apple-style Polishing Shine with 3D Depth */}
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                height: "50%",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 100%)",
                borderRadius: "16px 16px 0 0",
                pointerEvents: "none",
                boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(99, 102, 241, 0.05)",
              }}
            />
            {/* 3D Depth Layer */}
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                background: "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
                borderRadius: "16px",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                fontSize: "9px",
                fontWeight: 800,
                color: "#a5b4fc",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                zIndex: 2,
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              Developed by
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: COLORS.textMain,
                letterSpacing: "-0.4px",
                lineHeight: 1.2,
                textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                zIndex: 2,
              }}
            >
              Department of AI&DS
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem 0",
            scrollbarWidth: "none",
            zIndex: 1,
            position: "relative",
          }}
        >
          {/* Dashboard Item */}
          <div
            onClick={() => onNavigate("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 1.25rem",
              margin: "0 0.75rem 6px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              color: currentPage === "dashboard" ? COLORS.textMain : COLORS.textMuted,
              background:
                currentPage === "dashboard"
                  ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`
                  : "transparent",
              boxShadow:
                currentPage === "dashboard" ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "none",
              cursor: "pointer",
              transition: TRANSITION,
              fontFamily: FONT,
            }}
          >
            <i className="ti ti-layout-dashboard" style={{ fontSize: "20px" }} />
            <span>Dashboard</span>
          </div>

          <div
            style={{
              height: "1px",
              background: COLORS.border,
              margin: "16px 1.25rem",
            }}
          />

          {/* Menu Sections */}
          {!isAdmin ? (
            <>
              {SECTIONS.map((sec) => (
                <AccordionSection
                  key={sec.key}
                  sec={sec}
                  expanded={!!expanded[sec.key]}
                  onToggle={toggle}
                  currentPage={currentPage}
                  onNavigate={onNavigate}
                />
              ))}

              <div
                style={{
                  height: "1px",
                  background: COLORS.border,
                  margin: "16px 1.25rem",
                }}
              />

              {/* Transaction History - Direct Click */}
              <div
                onClick={() => onNavigate("transactions")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "12px",
                  padding: "12px 1.5rem",
                  margin: "0 0.75rem 2px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: currentPage === "transactions" ? 700 : 600,
                  color: currentPage === "transactions" ? COLORS.textMain : COLORS.textMuted,
                  background: currentPage === "transactions"
                    ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`
                    : "transparent",
                  boxShadow: currentPage === "transactions" ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "none",
                  cursor: "pointer",
                  transition: TRANSITION,
                  fontFamily: FONT,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== "transactions") e.currentTarget.style.color = COLORS.textMain;
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== "transactions") e.currentTarget.style.color = COLORS.textMuted;
                }}
              >
                <i className="ti ti-chart-bar" style={{ fontSize: "20px" }} />
                <span>Transaction History</span>
              </div>

              {/* Promote Students - Direct Click */}
              <div
                onClick={() => onNavigate("promote")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "12px",
                  padding: "12px 1.5rem",
                  margin: "2px 0.75rem 0",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: currentPage === "promote" ? 700 : 600,
                  color: currentPage === "promote" ? COLORS.textMain : COLORS.textMuted,
                  background: currentPage === "promote"
                    ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`
                    : "transparent",
                  boxShadow: currentPage === "promote" ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "none",
                  cursor: "pointer",
                  transition: TRANSITION,
                  fontFamily: FONT,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== "promote") e.currentTarget.style.color = COLORS.textMain;
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== "promote") e.currentTarget.style.color = COLORS.textMuted;
                }}
              >
                <i className="ti ti-school" style={{ fontSize: "20px" }} />
                <span>Promote Students</span>
              </div>
            </>
          ) : (
            <div
              onClick={() => onNavigate("accounts")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 1.25rem",
                margin: "0 0.75rem",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                color: currentPage === "accounts" ? COLORS.textMain : COLORS.textMuted,
                background: currentPage === "accounts" ? COLORS.primary : "transparent",
                cursor: "pointer",
                transition: TRANSITION,
                fontFamily: FONT,
              }}
            >
              <i className="ti ti-settings" style={{ fontSize: "20px" }} />
              <span>Account Management</span>
            </div>
          )}
        </div>

        {/* ── Polished Footer ── */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: `1px solid ${COLORS.border}`,
            zIndex: 1,
            position: "relative",
          }}
        >
          <div
            style={{
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: COLORS.textMain,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {username || "Administrator"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: COLORS.textMuted,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginTop: "4px",
              }}
            >
              {isAdmin ? "SUPER ADMIN" : dept.toUpperCase()}
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: COLORS.accentRed,
              background: COLORS.accentRedLight,
              cursor: "pointer",
              transition: TRANSITION,
              fontFamily: FONT,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.accentRedLight;
            }}
          >
            <i className="ti ti-logout" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}