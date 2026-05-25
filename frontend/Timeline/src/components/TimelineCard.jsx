import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt, FaExpandAlt, FaPencilAlt,
  FaTimes, FaSearch, FaUndo,
} from "react-icons/fa";
import { formatDate } from "../utils/helpers";
import { ALL_ICONS } from "../utils/eventIcons";
import { useEventIcon, useIconActions } from "../context/IconContext";

const GROUPS = ["All", ...Array.from(new Set(ALL_ICONS.map((i) => i.group)))];

export default function TimelineCard({ event, zoom, dark, onClick }) {
  const [showPicker, setShowPicker]   = useState(false);
  const [iconHovered, setIconHovered] = useState(false); 
  const [search, setSearch]           = useState("");
  const [activeGroup, setActiveGroup] = useState("All");

  const { Icon, color }               = useEventIcon(event);
  const { applyOverride, removeOverride } = useIconActions();

  const theme = dark
    ? { bg: "#1e293b", text: "#fff", sub: "#94a3b8", border: "#334155",
        input: "#0f172a", muted: "#475569" }
    : { bg: "#fff", text: "#111827", sub: "#64748b", border: "#e2e8f0",
        input: "#f8fafc", muted: "#94a3b8" };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ALL_ICONS.filter((ic) => {
      const groupOk = activeGroup === "All" || ic.group === activeGroup;
      const searchOk = !q || ic.label.toLowerCase().includes(q) || ic.key.includes(q);
      return groupOk && searchOk;
    });
  }, [search, activeGroup]);

  const handleIconSelect = (entry) => {
    applyOverride(event._eid, entry.key);
    setShowPicker(false);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    removeOverride(event._eid);
    setShowPicker(false);
  };

  const openPicker = (e) => {
    e.stopPropagation(); 
    setSearch("");
    setActiveGroup("All");
    setShowPicker(true);
  };

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .tl-card-inner { min-width: 220px !important; padding: 15px !important; }
          .tl-card-inner .card-title { font-size: 14px !important; }
          .tl-card-inner .card-desc  { font-size: 12px !important; }
          .tl-card-icon { width: 36px !important; height: 36px !important; border-radius: 11px !important; }
          .icon-picker-panel { width: 96vw !important; max-height: 90vh !important; }
        }
        .picker-scroll::-webkit-scrollbar { width: 5px; }
        .picker-scroll::-webkit-scrollbar-thumb {
          background: ${dark ? "#334155" : "#cbd5e1"};
          border-radius: 10px;
        }
        .group-tab-scroll::-webkit-scrollbar { display: none; }
        .icon-btn:hover { transform: scale(1.08); }
        .icon-btn { transition: transform 0.12s, background 0.12s, border-color 0.12s; }
      `}</style>

      <div style={{ position: "relative" }}>
        <motion.div
          className="tl-card-inner"
          layout
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={onClick}
          style={{
            minWidth: 260, background: theme.bg, borderRadius: 18, padding: 18,
            boxShadow: "0 8px 22px rgba(0,0,0,0.06)", cursor: "pointer",
            border: `1px solid ${theme.border}`, position: "relative", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 4,
            background: `linear-gradient(90deg, ${color}, #7c3aed)`,
            borderRadius: "18px 18px 0 0",
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <div 
              className="tl-card-icon" 
              onMouseEnter={() => setIconHovered(true)}
              onMouseLeave={() => setIconHovered(false)}
              onClick={(e) => {
                e.stopPropagation();
                openPicker(e);
              }}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${color}18`, border: `1.5px solid ${color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden", cursor: "pointer"
              }}
            >
              <Icon size={18} color={color} />

              <AnimatePresence>
                {iconHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: dark ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: color,
                    }}
                  >
                    <FaPencilAlt size={12} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#2563eb", fontWeight: 700, fontSize: 11, marginBottom: 7 }}>
            <FaCalendarAlt size={10} /> {formatDate(event.date, zoom)}
          </div>
          <div className="card-title" style={{ color: theme.text, fontSize: 15, fontWeight: 700, marginBottom: 7, lineHeight: 1.3 }}>
            {event.title}
          </div>
          <div className="card-desc" style={{ color: theme.sub, fontSize: 12, lineHeight: 1.55 }}>
            {event.description.substring(0, 80)}…
          </div>
          <div style={{ position: "absolute", bottom: 13, right: 13, color, opacity: 0.4 }}>
            <FaExpandAlt size={11} />
          </div>
        </motion.div>

        <AnimatePresence>
          {showPicker && (
            <>
=              <div
                onClick={() => setShowPicker(false)}
                style={{
                  position: "fixed", inset: 0, zIndex: 999,
                  background: "rgba(15,23,42,0.5)",
                  backdropFilter: "blur(6px)",
                }}
              />

              <motion.div
                className="icon-picker-panel"
                initial={{ opacity: 0, scale: 0.94, y: "-44%", x: "-50%" }}
                animate={{ opacity: 1, scale: 1,    y: "-50%", x: "-50%" }}
                exit={{   opacity: 0, scale: 0.94,  y: "-44%", x: "-50%" }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "fixed", top: "50%", left: "50%", zIndex: 1000,
                  background: dark ? "#1e293b" : "#fff",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 24, width: 480, maxWidth: "94vw", maxHeight: "88vh",
                  display: "flex", flexDirection: "column",
                  boxShadow: "0 32px 64px -12px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "20px 20px 0", borderBottom: `1px solid ${dark ? "#2d3748" : "#f1f5f9"}`, paddingBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: dark ? "#fff" : "#111827" }}>Choose Icon</div>
                      <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
                        for: <span style={{ color: "#2563eb", fontWeight: 600 }}>{event.title}</span>
                        <span style={{ marginLeft: 8, color: theme.muted }}>· {ALL_ICONS.length} icons</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPicker(false)}
                      style={{
                        background: dark ? "#334155" : "#f1f5f9", border: "none", cursor: "pointer",
                        color: dark ? "#94a3b8" : "#64748b", borderRadius: "50%",
                        width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <FaTimes size={13} />
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.input, borderRadius: 12, border: `1px solid ${theme.border}`, padding: "9px 14px", marginBottom: 14 }}>
                    <FaSearch size={13} color={theme.muted} />
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search icons…"
                      style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: 14, color: dark ? "#fff" : "#111827" }}
                    />
                    {search && (
                      <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: theme.muted, display: "flex", padding: 0 }}>
                        <FaTimes size={11} />
                      </button>
                    )}
                  </div>

                  <div className="group-tab-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
                    {GROUPS.map((g) => {
                      const count = g === "All" ? ALL_ICONS.length : ALL_ICONS.filter((i) => i.group === g).length;
                      const active = activeGroup === g;
                      return (
                        <button
                          key={g}
                          onClick={() => setActiveGroup(g)}
                          style={{
                            padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, fontWeight: active ? 700 : 500,
                            background: active ? "linear-gradient(135deg, #2563eb, #7c3aed)" : (dark ? "#0f172a" : "#f1f5f9"),
                            color: active ? "#fff" : (dark ? "#94a3b8" : "#64748b"), transition: "all 0.15s", flexShrink: 0,
                          }}
                        >
                          {g} <span style={{ marginLeft: 5, fontSize: 10, opacity: active ? 0.8 : 0.6 }}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="picker-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: theme.muted, fontSize: 14 }}>
                      No icons match "{search}"
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8 }}>
                      {filtered.map((entry) => {
                        const { Icon: EntryIcon, color: ec, key, label } = entry;
                        return (
                          <button
                            key={key}
                            className="icon-btn"
                            title={label}
                            onClick={() => handleIconSelect(entry)}
                            style={{
                              borderRadius: 14, background: dark ? "#0f172a" : "#f8fafc", border: `1.5px solid ${dark ? "#1e293b" : "#e2e8f0"}`,
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", padding: "12px 4px 10px",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = `${ec}15`; e.currentTarget.style.borderColor = ec; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = dark ? "#0f172a" : "#f8fafc"; e.currentTarget.style.borderColor = dark ? "#1e293b" : "#e2e8f0"; }}
                          >
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${ec}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <EntryIcon size={18} color={ec} />
                            </div>
                            <span style={{ fontSize: 10, lineHeight: 1.2, textAlign: "center", color: dark ? "#64748b" : "#94a3b8", fontWeight: 500, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingInline: 2 }}>
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${dark ? "#2d3748" : "#f1f5f9"}`, display: "flex", gap: 10 }}>
                  <button
                    onClick={handleReset}
                    style={{
                      flex: 1, padding: "11px", borderRadius: 12, background: dark ? "#334155" : "#f1f5f9",
                      border: "none", color: dark ? "#e2e8f0" : "#334155", fontWeight: 600, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}
                  >
                    <FaUndo size={11} /> Reset to auto
                  </button>
                  <button onClick={() => setShowPicker(false)} style={{ padding: "11px 18px", borderRadius: 12, background: dark ? "#1e293b" : "#e2e8f0", border: `1px solid ${theme.border}`, color: dark ? "#94a3b8" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}