import { useState } from "react";
import { motion } from "framer-motion";
import { HiSave, HiX } from "react-icons/hi";
import { API } from "../constants";

const getDeviceMac = () => localStorage.getItem('user_device_mac') || "";

export default function EditModal({ dark, timeline, onClose, onSaved }) {
  const [events, setEvents] = useState(() => {
    const rawEvents = timeline?.events || [];
    return rawEvents.map((e) => ({
      ...e,
      date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
    }));
  });
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    const datasetId = parseInt(timeline?.id, 10);
    if (!datasetId || isNaN(datasetId)) { alert("Invalid timeline ID. Cannot save."); return; }
    setSaving(true);
    try {
      const currentDeviceMac = getDeviceMac();
      const formatted = events.map((e) => ({
        id: e.id ? parseInt(e.id, 10) : null,
        title: e.title || "",
        name: e.title || "",
        date: e.date,
        description: e.description || "",
      }));
      const res = await fetch(`${API}/update/${datasetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-device-mac": currentDeviceMac },
        body: JSON.stringify({ name: timeline.name, events: formatted }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Timeline changes saved!");
        if (data.dataset && data.dataset.events) {
          onSaved({ ...timeline, events: data.dataset.events.map((e) => ({ ...e, date: new Date(e.date) })) });
        } else {
          onSaved({ ...timeline, events: formatted.map((e) => ({ ...e, date: new Date(e.date) })) });
        }
        onClose();
      } else {
        alert(`Update failed: ${data.error || "Unknown error."}`);
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Update failed. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const updateEvent = (index, field, value) => {
    setEvents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const th = {
    bg: dark ? "#0f172a" : "#fff",
    text: dark ? "#fff" : "#111827",
    inputBg: dark ? "#0f172a" : "#fff",
    inputColor: dark ? "#fff" : "#000",
    cardBg: dark ? "#1e293b55" : "#f8fafc",
    border: dark ? "#1e293b" : "#f1f5f9",
    stickyBg: dark ? "#0f172a" : "#fff",
    cancelBg: dark ? "#334155" : "#e2e8f0",
    cancelColor: dark ? "#fff" : "#475569",
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    marginBottom: 13,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: th.inputBg,
    color: th.inputColor,
    boxSizing: "border-box",
    fontSize: 14,
    fontFamily: "inherit",
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.8)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      backdropFilter: "blur(8px)",
    }}>
      <style>{`
        @media (min-width: 641px) {
          .em-sheet { align-self: center !important; border-radius: 22px !important; max-width: 700px !important; max-height: 85vh !important; }
        }
        @media (max-width: 640px) {
          .em-sheet { border-radius: 20px 20px 0 0 !important; width: 100% !important; max-height: 90vh !important; padding: 20px 16px 0 !important; }
          .em-sticky-header { padding-bottom: 12px !important; }
          .em-footer { padding: 12px 0 28px !important; }
          .em-footer button { padding: 15px !important; font-size: 14px !important; }
          .em-event-card { padding: 15px !important; }
        }
      `}</style>

      <motion.div
        className="em-sheet"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        style={{
          background: th.bg,
          width: "100%",
          maxWidth: 700,
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: 22,
          padding: "30px 28px 0",
          border: `1px solid ${dark ? "#334155" : "#ddd"}`,
        }}
      >
        {/* Sticky header */}
        <div
          className="em-sticky-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
            position: "sticky",
            top: 0,
            background: th.stickyBg,
            paddingBottom: 14,
            zIndex: 10,
            borderBottom: `1px solid ${th.border}`,
          }}
        >
          <h2 style={{ color: th.text, margin: 0, fontSize: "1.1rem" }}>Edit Timeline Events</h2>
          <button
            onClick={onClose}
            style={{
              background: "#ef444415", border: "none", cursor: "pointer",
              color: "#ef4444", borderRadius: "50%", padding: 7, display: "flex",
            }}
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Event cards */}
        {events.map((ev, i) => (
          <div
            key={ev.id || i}
            className="em-event-card"
            style={{
              marginBottom: 16,
              padding: 18,
              border: `1px solid ${th.border}`,
              borderRadius: 16,
              background: th.cardBg,
            }}
          >
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 5, letterSpacing: "0.05em" }}>
              TITLE
            </label>
            <input
              value={ev.title || ""}
              onChange={(e) => updateEvent(i, "title", e.target.value)}
              style={inputStyle}
            />

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 5, letterSpacing: "0.05em" }}>
              DATE
            </label>
            <input
              type="date"
              value={ev.date}
              onChange={(e) => updateEvent(i, "date", e.target.value)}
              style={inputStyle}
            />

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 5, letterSpacing: "0.05em" }}>
              DESCRIPTION
            </label>
            <textarea
              value={ev.description || ""}
              onChange={(e) => updateEvent(i, "description", e.target.value)}
              style={{ ...inputStyle, minHeight: 72, resize: "vertical", marginBottom: 0 }}
            />
          </div>
        ))}

        {/* Sticky footer */}
        <div
          className="em-footer"
          style={{
            display: "flex",
            gap: 12,
            position: "sticky",
            bottom: 0,
            background: th.stickyBg,
            paddingTop: 14,
            paddingBottom: 24,
          }}
        >
          <button
            onClick={handleUpdate}
            disabled={saving}
            style={{
              flex: 2,
              padding: "16px 20px",
              background: saving ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <HiSave size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              padding: "16px 20px",
              background: th.cancelBg,
              color: th.cancelColor,
              border: "none",
              borderRadius: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}