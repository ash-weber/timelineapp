import { motion } from "framer-motion";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";
import { formatDate } from "../utils/helpers";
import { getEventIcon } from "../utils/eventIcons";

export default function EventDetailsModal({ event, dark, onClose, zoom }) {
  const { Icon, color } = getEventIcon(event);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.75)",
      zIndex: 2000,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",    
      backdropFilter: "blur(8px)",
      padding: "0",
    }}>
      <style>{`
        @media (min-width: 641px) {
          .edm-sheet { align-self: center !important; border-radius: 24px !important; max-width: 500px !important; margin: 0 auto; }
        }
        @media (max-width: 640px) {
          .edm-sheet { border-radius: 22px 22px 0 0 !important; width: 100% !important; padding: 24px 20px 36px !important; }
        }
      `}</style>

      <motion.div
        className="edm-sheet"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        style={{
          background: dark ? "#1e293b" : "#fff",
          width: "100%",
          maxWidth: 500,
          borderRadius: 24,
          padding: 32,
          border: `1px solid ${dark ? "#334155" : "#ddd"}`,
          position: "relative",
          overflow: "hidden",
          margin: "0 auto",
        }}
      >
        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${color}, #7c3aed)`,
        }} />

        {/* Mobile drag handle */}
        <div style={{
          width: 36, height: 4, background: dark ? "#334155" : "#e2e8f0",
          borderRadius: 4, margin: "4px auto 18px",
          display: "none",
        }} className="edm-handle" />

        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "#ef444415", border: "none", cursor: "pointer",
            color: "#ef4444", borderRadius: "50%", padding: 8,
            display: "flex",
          }}
        >
          <FaTimes size={16} />
        </button>

        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${color}18`,
          border: `1.5px solid ${color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 14, marginTop: 8,
        }}>
          <Icon size={22} color={color} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#2563eb", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
          <FaCalendarAlt size={12} /> {formatDate(event.date, zoom)}
        </div>

        <h2 style={{ color: dark ? "#fff" : "#111827", marginTop: 0, marginBottom: 12, fontSize: "1.15rem", lineHeight: 1.3 }}>
          {event.title}
        </h2>

        <p style={{ color: dark ? "#94a3b8" : "#64748b", lineHeight: 1.7, fontSize: 14, margin: 0 }}>
          {event.description}
        </p>
      </motion.div>

      <style>{`
        @media (max-width: 640px) {
          .edm-handle { display: block !important; }
        }
      `}</style>
    </div>
  );
}