import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTable, FaArrowRight, FaCheck, FaTimes,
  FaExclamationTriangle, FaTag,
  FaCalendarAlt, FaAlignLeft,
} from "react-icons/fa";


export default function ColumnMapper({ headers, sampleRows = [], dark, onConfirm, onCancel }) {
  const autoGuess = useMemo(() => {
    const find = (candidates) =>
      headers.find((h) => candidates.some((c) => h.toLowerCase().includes(c))) || "";
    return {
      name:        find(["name", "title", "event", "label", "summary"]),
      date:        find(["date", "time", "when", "day", "month", "year", "timestamp"]),
      description: find(["desc", "detail", "note", "info", "body", "content", "text"]),
    };
  }, [headers]);

  const [mapping, setMapping] = useState(autoGuess);

  const th = dark
    ? { bg: "#0f172a", surface: "#1e293b", card: "#0f172a", text: "#f1f5f9", sub: "#94a3b8", border: "#334155", inputBg: "#0f172a", muted: "#475569" }
    : { bg: "#f8fafc", surface: "#fff", card: "#f8fafc", text: "#111827", sub: "#64748b", border: "#e2e8f0", inputBg: "#f1f5f9", muted: "#94a3b8" };

  const FIELDS = [
    { key: "name",        label: "Event Name",  Icon: FaTag,         required: true,  hint: "The title of each event" },
    { key: "date",        label: "Date",         Icon: FaCalendarAlt, required: true,  hint: "When the event occurred" },
    { key: "description", label: "Description",  Icon: FaAlignLeft,   required: false, hint: "Optional details about the event" },
  ];

  const isValid   = !!(mapping.name && mapping.date);
  const conflicts = FIELDS.filter((f) => {
    const val = mapping[f.key];
    return val && FIELDS.filter((o) => o.key !== f.key && mapping[o.key] === val).length > 0;
  });
  const hasConflict = conflicts.length > 0;

  const setField      = (key, value) => setMapping((prev) => ({ ...prev, [key]: value }));
  const handleConfirm = () => { if (isValid && !hasConflict) onConfirm(mapping); };

  const previewVal = (field, row) => {
    const col = mapping[field];
    if (!col) return <span style={{ opacity: 0.3, fontStyle: "italic" }}>—</span>;
    const val = row[col];
    if (!val) return <span style={{ opacity: 0.3, fontStyle: "italic" }}>empty</span>;
    const str = String(val);
    return <span style={{ color: th.text }}>{str.slice(0, 36)}{str.length > 36 ? "…" : ""}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      style={{
        background: th.surface,
        border: `1px solid ${th.border}`,
        borderRadius: 20,
        padding: "28px 28px 24px",
        marginBottom: 24,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#2563eb22,#7c3aed22)",
            border: "1.5px solid #2563eb44",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FaTable size={14} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: th.text }}>Map CSV Columns</div>
            <div style={{ fontSize: 12, color: th.sub, marginTop: 1 }}>
              {headers.length} column{headers.length !== 1 ? "s" : ""} detected — assign each field below
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          title="Cancel"
          style={{
            background: "#ef444415", border: "none", cursor: "pointer",
            color: "#ef4444", borderRadius: "50%", padding: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <FaTimes size={14} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
        {FIELDS.map(({ key, label, Icon, required, hint }) => {
          const val          = mapping[key];
          const isConflicted = hasConflict && conflicts.some((f) => f.key === key);
          const isMapped     = !!val;

          return (
            <div
              key={key}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 13,
                border: `1.5px solid ${isConflicted ? "#ef4444" : isMapped ? "#2563eb44" : th.border}`,
                background: isConflicted
                  ? "#ef444408"
                  : isMapped
                  ? (dark ? "#2563eb10" : "#eff6ff")
                  : th.card,
                transition: "all 0.18s ease",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: isMapped ? "#2563eb18" : (dark ? "#1e293b" : "#f1f5f9"),
                border: `1.5px solid ${isMapped ? "#2563eb44" : th.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={13} color={isMapped ? "#2563eb" : th.muted} />
              </div>

              <div style={{ flex: "0 0 130px", minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: th.text, display: "flex", alignItems: "center", gap: 5 }}>
                  {label}
                  {required && (
                    <span style={{ fontSize: 9, background: "#2563eb", color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 700, letterSpacing: "0.04em" }}>
                      REQ
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>{hint}</div>
              </div>

              <FaArrowRight size={11} color={isMapped ? "#2563eb" : th.muted} style={{ flexShrink: 0 }} />

              <select
                value={val}
                onChange={(e) => setField(key, e.target.value)}
                style={{
                  flex: 1, padding: "9px 12px", borderRadius: 10, fontFamily: "inherit",
                  border: `1.5px solid ${isConflicted ? "#ef4444" : isMapped ? "#2563eb66" : th.border}`,
                  background: th.inputBg,
                  color: val ? th.text : th.muted,
                  fontSize: 13, fontWeight: val ? 600 : 400,
                  cursor: "pointer", outline: "none",
                }}
              >
                <option value="">— select column —</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>

              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: isConflicted ? "#ef4444" : isMapped ? "#22c55e" : (dark ? "#1e293b" : "#f1f5f9"),
                border: `1.5px solid ${isConflicted ? "#ef4444" : isMapped ? "#22c55e" : th.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isMapped && !isConflicted && <FaCheck size={9} color="#fff" />}
                {isConflicted && <FaTimes size={9} color="#fff" />}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {hasConflict && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{
              background: "#ef444410", border: "1px solid #ef444444",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 12, color: "#ef4444", fontWeight: 600, overflow: "hidden",
            }}
          >
            <FaExclamationTriangle size={12} />
            Two or more fields are mapped to the same column. Please use distinct columns.
          </motion.div>
        )}
      </AnimatePresence>

      {sampleRows.length > 0 && (mapping.name || mapping.date || mapping.description) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: th.muted, letterSpacing: "0.06em", marginBottom: 8 }}>
            PREVIEW (first {Math.min(sampleRows.length, 3)} rows)
          </div>
          <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${th.border}` }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
              background: dark ? "#1e293b" : "#f1f5f9",
              padding: "8px 14px", gap: 12,
            }}>
              {["Event Name", "Date", "Description"].map((h) => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", letterSpacing: "0.05em" }}>
                  {h.toUpperCase()}
                </div>
              ))}
            </div>
            {sampleRows.slice(0, 3).map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
                  padding: "9px 14px", gap: 12,
                  borderTop: `1px solid ${th.border}`,
                  background: i % 2 === 0 ? "transparent" : (dark ? "#ffffff04" : "#00000004"),
                  fontSize: 12,
                }}
              >
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{previewVal("name", row)}</div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{previewVal("date", row)}</div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{previewVal("description", row)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleConfirm}
          disabled={!isValid || hasConflict}
          style={{
            flex: 2, padding: "13px 20px", border: "none", borderRadius: 12,
            background: isValid && !hasConflict
              ? "linear-gradient(135deg,#2563eb,#7c3aed)"
              : (dark ? "#1e293b" : "#e2e8f0"),
            color: isValid && !hasConflict ? "#fff" : th.muted,
            fontWeight: 700, fontSize: 14,
            cursor: isValid && !hasConflict ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
          }}
        >
          <FaCheck size={13} />
          {isValid
            ? "Save Mapping & Continue"
            : `Assign ${!mapping.name ? "Name" : "Date"} to continue`}
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: "13px 16px", border: "none", borderRadius: 12,
            background: dark ? "#334155" : "#e2e8f0",
            color: dark ? "#e2e8f0" : "#475569",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}