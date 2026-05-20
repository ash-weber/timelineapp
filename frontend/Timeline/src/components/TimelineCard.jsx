import { motion } from "framer-motion";
import { FaCalendarAlt, FaExpandAlt } from "react-icons/fa";
import { formatDate } from "../utils/helpers";
import { getEventIcon } from "../utils/eventIcons";

export default function TimelineCard({ event, zoom, dark, onClick }) {
  const theme = dark
    ? { bg: "#1e293b", text: "#fff", sub: "#94a3b8", border: "#334155" }
    : { bg: "#fff", text: "#111827", sub: "#64748b", border: "#e2e8f0" };

  const { Icon, color } = getEventIcon(event);

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .tl-card-inner {
            min-width: 220px !important;
            padding: 15px !important;
          }
          .tl-card-inner .card-title { font-size: 14px !important; }
          .tl-card-inner .card-desc  { font-size: 12px !important; }
          .tl-card-icon { width: 36px !important; height: 36px !important; border-radius: 11px !important; margin-bottom: 11px !important; }
        }
      `}</style>
      <motion.div
        className="tl-card-inner"
        layout
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8, scale: 1.015 }}
        onClick={onClick}
        style={{
          minWidth: 260,
          background: theme.bg,
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
          cursor: "pointer",
          border: `1px solid ${theme.border}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${color}, #7c3aed)`,
          borderRadius: "18px 18px 0 0",
        }} />

        <div
          className="tl-card-icon"
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${color}18`,
            border: `1.5px solid ${color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Icon size={18} color={color} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#2563eb", fontWeight: 700, fontSize: 11, marginBottom: 7, letterSpacing: "0.03em" }}>
          <FaCalendarAlt size={10} />
          {formatDate(event.date, zoom)}
        </div>

        <div className="card-title" style={{ color: theme.text, fontSize: 15, fontWeight: 700, marginBottom: 7, lineHeight: 1.3 }}>
          {event.title}
        </div>

        <div className="card-desc" style={{ color: theme.sub, fontSize: 12, lineHeight: 1.55 }}>
          {event.description.substring(0, 80)}…
        </div>

        <div style={{ position: "absolute", top: 13, right: 13, color: color, opacity: 0.4 }}>
          <FaExpandAlt size={11} />
        </div>
      </motion.div>
    </>
  );
}