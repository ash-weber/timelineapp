import { motion } from "framer-motion";
import { HiEye, HiPencil, HiTrash } from "react-icons/hi";
import { FaDatabase } from "react-icons/fa";

export default function SavedDatasetsSidebar({
  dark,
  savedList,
  selectedTimeline,
  onOpen,
  onEdit,
  onDelete,
  th,
}) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      {savedList.length === 0 ? (
        <p style={{ opacity: 0.5, fontSize: 13, textAlign: "center", marginTop: 24 }}>
          No saved timelines yet.
        </p>
      ) : (
        <div style={{
          display: "flex", flexDirection: "column", gap: 9,
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          paddingRight: 2,
        }}>
          {savedList.map((item) => {
            const isSelected = selectedTimeline?.id === item.id;
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 13,
                  background: isSelected
                    ? (dark ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.08)")
                    : (dark ? "#1e293b" : "#f8fafc"),
                  border: `1.5px solid ${isSelected ? "#2563eb" : th.border}`,
                  transition: "all 0.18s ease",
                }}
              >
                <div
                  onClick={() => onOpen(item)}
                  style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, cursor: "pointer", minWidth: 0 }}
                >
                  <FaDatabase size={13} color={isSelected ? "#2563eb" : (dark ? "#64748b" : "#94a3b8")} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: isSelected ? "#2563eb" : th.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {item.name}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 5, marginLeft: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => onOpen(item)}
                    title="View"
                    style={{
                      padding: 7,
                      background: isSelected ? "#2563eb" : (dark ? "#334155" : "#e2e8f0"),
                      color: isSelected ? "#fff" : th.text,
                      border: "none", borderRadius: 8, cursor: "pointer",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <HiEye size={13} />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    title="Edit"
                    style={{
                      padding: 7,
                      background: dark ? "#059669" : "#10b981",
                      color: "#fff",
                      border: "none", borderRadius: 8, cursor: "pointer",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <HiPencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                    style={{
                      padding: 7,
                      background: "#ef4444",
                      color: "#fff",
                      border: "none", borderRadius: 8, cursor: "pointer",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <HiTrash size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}