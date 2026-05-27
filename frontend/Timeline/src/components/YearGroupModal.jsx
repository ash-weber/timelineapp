import { motion } from "framer-motion";
import { FaTimes, FaCalendarAlt, FaLayerGroup } from "react-icons/fa";
import { formatDate } from "../utils/helpers";
import { useEventIcon } from "../context/IconContext";

function YearEventRow({ ev, dark, onClose, onSelectEvent }) {
  const { Icon, color } = useEventIcon(ev);
  return (
    <div
      onClick={() => { onClose(); onSelectEvent(ev); }}
      style={{
        padding: "13px 14px",
        borderRadius: 14,
        border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
        background: dark ? "#0f172a" : "#f8fafc",
        cursor: "pointer",
        transition: "border-color 0.18s",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 8,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = dark ? "#334155" : "#e2e8f0")}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 11,
        background: `${color}18`,
        border: `1.5px solid ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} color={color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontWeight: 700, fontSize: 10, marginBottom: 3 }}>
          <FaCalendarAlt size={9} /> {formatDate(ev.date, "month")}
        </div>
        <div style={{
          color: dark ? "#fff" : "#111827",
          fontWeight: 700, fontSize: 13,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          marginBottom: 3,
        }}>
          {ev.title}
        </div>
        {ev.description && (
          <div style={{
            color: dark ? "#94a3b8" : "#64748b", fontSize: 11, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {ev.description}
          </div>
        )}
      </div>
    </div>
  );
}

export default function YearGroupModal({ year, events, dark, grouping, onClose, onSelectEvent }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.75)",
      zIndex: 2000,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      backdropFilter: "blur(8px)",
    }}>
      <style>{`
        @media (min-width: 641px) {
          .ygm-sheet { align-self: center !important; border-radius: 24px !important; max-width: 520px !important; max-height: 80vh !important; }
        }
        @media (max-width: 640px) {
          .ygm-sheet { border-radius: 22px 22px 0 0 !important; width: 100% !important; max-height: 82vh !important; padding: 20px 16px 32px !important; }
          .ygm-handle { display: block !important; }
        }
      `}</style>

      <motion.div
        className="ygm-sheet"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        style={{
          background: dark ? "#1e293b" : "#fff",
          width: "100%",
          maxWidth: 520,
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: 24,
          padding: 28,
          border: `1px solid ${dark ? "#334155" : "#ddd"}`,
          position: "relative",
        }}
      >
        <div
          className="ygm-handle"
          style={{
            width: 36, height: 4,
            background: dark ? "#334155" : "#e2e8f0",
            borderRadius: 4,
            margin: "0 auto 16px",
            display: "none",
          }}
        />

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

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#2563eb", fontWeight: 700, fontSize: 11, marginBottom: 5, letterSpacing: "0.05em" }}>
          <FaLayerGroup size={12} /> YEAR GROUP
        </div>

        <h2 style={{ color: dark ? "#fff" : "#111827", marginTop: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 9, fontSize: "1.1rem" }}>
          <FaCalendarAlt size={18} color="#7c3aed" />
          {year} — {events.length} Event{events.length !== 1 ? "s" : ""}
        </h2>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {events.map((ev, i) => (
            <YearEventRow
              key={ev._eid ?? ev.id ?? i}
              ev={ev}
              dark={dark}
              onClose={onClose}
              onSelectEvent={onSelectEvent}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}