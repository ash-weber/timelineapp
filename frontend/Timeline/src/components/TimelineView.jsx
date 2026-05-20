import { useState, useEffect, useRef } from "react";
import {
  FaMoon, FaSun, FaStream, FaUpload, FaSave,
  FaTable, FaChartBar, FaArrowsAltH, FaArrowsAltV,
  FaCalendarAlt, FaRegCalendar, FaCalendarDay,
  FaDownload, FaSpinner, FaDatabase, FaTimes
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

import { API } from "../constants";
import { parseCSV, groupEventsByYear } from "../utils/helpers";
import { getOrDeviceMac } from "../utils/deviceMac";

import SavedDatasetsSidebar from "./SavedDatasetsSidebar";
import TimelineRenderer from "./TimelineRenderer";
import EventDetailsModal from "./EventDetailsModal";
import YearGroupModal from "./YearGroupModal";
import EditModal from "./EditModal";

const ZOOM_META = [
  { key: "year",  label: "Year",  Icon: FaCalendarAlt },
  { key: "month", label: "Month", Icon: FaRegCalendar },
  { key: "day",   label: "Day",   Icon: FaCalendarDay },
];

export default function TimelineView() {
  const [dark, setDark] = useState(false);
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [preview, setPreview] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [generated, setGenerated] = useState(false);
  const [zoom, setZoom] = useState("month");
  const [view, setView] = useState("vertical");
  const [savedList, setSavedList] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [editTimeline, setEditTimeline] = useState(null);
  const [viewEvent, setViewEvent] = useState(null);
  const [viewYearGroup, setViewYearGroup] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fileRef = useRef();
  const timelineRef = useRef();

  const th = dark
    ? { bg: "#0a0f1e", surface: "#111827", text: "#fff", border: "#334155" }
    : { bg: "#f1f5f9", surface: "#fff", text: "#111827", border: "#e2e8f0" };

  useEffect(() => { fetchSaved(); }, []);

  const fetchSaved = async () => {
    try {
      const mac = getOrDeviceMac();
      const res = await fetch(`${API}/datasets`, {
        method: "GET",
        headers: { "x-device-mac": mac }
      });
      const data = await res.json();
      if (data.success) setSavedList(data.datasets);
    } catch (err) {
      console.error("fetchSaved error:", err);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setDatasetName(f.name.replace(".csv", ""));
    const r = new FileReader();
    r.onload = (ev) => setCsvText(ev.target.result);
    r.readAsText(f);
  };

  const handleSaveToDB = async () => {
    if (!file || parsed.length === 0) return;
    const name = window.prompt("Enter a name for this timeline dataset:", datasetName || "");
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    setDatasetName(trimmedName);
    try {
      const mac = getOrDeviceMac();
      const res = await fetch(`${API}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-device-mac": mac },
        body: JSON.stringify({ name: trimmedName, events: parsed }),
      });
      if ((await res.json()).success) {
        alert("Timeline Saved!");
        fetchSaved();
      }
    } catch {
      alert("Save failed");
    }
  };

  const handleDownloadImage = async () => {
    if (!timelineRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: dark ? "#111827" : "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      const name = selectedTimeline?.name || "timeline";
      link.download = `${name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timeline?")) return;
    try {
      const mac = getOrDeviceMac();
      await fetch(`${API}/delete/${id}`, {
        method: "DELETE",
        headers: { "x-device-mac": mac }
      });
      fetchSaved();
      if (selectedTimeline?.id === id) setGenerated(false);
      setDropdownOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openTimeline = async (item) => {
    try {
      const mac = getOrDeviceMac();
      const res = await fetch(`${API}/get/name/${encodeURIComponent(item.name)}`, {
        method: "GET",
        headers: { "x-device-mac": mac }
      });
      const data = await res.json();
      if (!data.success) { alert(data.error || "Unauthorized Access"); return null; }
      const formatted = data.data.map((e) => ({
        ...e,
        title: e.title || e.name,
        date: new Date(e.date),
      }));
      setSelectedTimeline({ ...item, events: formatted });
      setGenerated(true);
      setPreview(false);
      setDropdownOpen(false);
      setSidebarOpen(false);
      return formatted;
    } catch (err) {
      console.error("openTimeline error:", err);
      return null;
    }
  };

  const handleEditOpen = async (item) => {
    const fetchedEvents = await openTimeline(item);
    if (fetchedEvents) setEditTimeline({ ...item, events: fetchedEvents });
  };

  const events = selectedTimeline ? selectedTimeline.events : parsed;
  const yearGroups = groupEventsByYear(events);

  return (
    <div style={{
      minHeight: "100vh",
      background: th.bg,
      color: th.text,
      transition: "background 0.4s, color 0.4s",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        * { box-sizing: border-box; }

        .tl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 32px;
          height: 72px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .tl-logo { display: flex; align-items: center; gap: 12px; }
        .tl-logo h2 { margin: 0; font-size: 1.25rem; letter-spacing: -0.5px; white-space: nowrap; }
        .tl-header-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

        .tl-main { padding: 28px 32px 48px; }

        .tl-card {
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 24px;
        }

        .tl-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          color: #fff;
          transition: opacity 0.18s, transform 0.15s;
          white-space: nowrap;
        }
        .tl-btn:hover { opacity: 0.87; transform: translateY(-1px); }
        .tl-btn:active { transform: translateY(0); opacity: 1; }

        .tl-upload-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .tl-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .tl-controls-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tl-zoom-group {
          display: flex;
          gap: 3px;
          padding: 4px;
          border-radius: 12px;
        }
        .tl-view-group {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .tl-table-wrap {
          overflow-x: auto;
          border-radius: 14px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        .tl-table { width: 100%; border-collapse: collapse; min-width: 440px; }
        .tl-table th { padding: 11px 14px; text-align: left; font-size: 11px; letter-spacing: 0.05em; font-weight: 700; }
        .tl-table td { padding: 11px 14px; font-size: 13px; }

        .tl-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 340px;
          z-index: 150;
          padding: 28px 22px;
          overflow-y: auto;
        }

        .tl-toggle {
          width: 54px; height: 27px;
          border-radius: 20px;
          cursor: pointer;
          position: relative;
          padding: 3px;
          transition: background 0.3s;
          flex-shrink: 0;
        }
        .tl-toggle-knob {
          width: 21px; height: 21px;
          background: #fff;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        /* ── MOBILE ≤ 640px ── */
        @media (max-width: 640px) {
          .tl-header {
            padding: 0 14px;
            height: 58px;
          }
          .tl-logo-icon {
            width: 34px !important;
            height: 34px !important;
            border-radius: 10px !important;
          }
          .tl-logo h2 { font-size: 0.95rem; }
          .tl-datasets-label { display: none; }

          .tl-main { padding: 12px 12px 40px; }

          .tl-card { padding: 16px 14px; border-radius: 15px; margin-bottom: 14px; }
          .tl-card h2 { font-size: 1.05rem !important; margin-bottom: 14px !important; }
          .tl-card h3 { font-size: 0.95rem !important; }

          .tl-upload-row {
            flex-direction: column;
            align-items: stretch;
          }
          .tl-upload-row .tl-btn { width: 100%; justify-content: center; }
          .tl-file-name {
            font-size: 12px !important;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .tl-preview-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .tl-generate-btn { width: 100%; justify-content: center !important; }

          .tl-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 16px;
          }
          .tl-controls-title { font-size: 0.95rem; }

          .tl-zoom-group {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .tl-zoom-group::-webkit-scrollbar { display: none; }
          .tl-zoom-group button { flex-shrink: 0; }

          .tl-view-group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .tl-view-group .tl-btn {
            justify-content: center;
            padding: 9px 10px !important;
            font-size: 12px !important;
          }
          .tl-view-group .tl-btn:last-child:nth-child(odd) {
            grid-column: 1 / -1;
          }

          .tl-sidebar {
            width: 100% !important;
            border-right: none !important;
          }

          .tl-year-hint {
            font-size: 11px !important;
            padding: 7px 11px !important;
          }
        }

        /* ── TABLET 641-1024px ── */
        @media (min-width: 641px) and (max-width: 1024px) {
          .tl-header { padding: 0 22px; height: 66px; }
          .tl-main { padding: 20px 22px 40px; }
          .tl-card { padding: 22px 22px; }
          .tl-sidebar { width: 300px; }
          .tl-controls { gap: 10px; }
        }

        .tl-noscrollbar::-webkit-scrollbar { display: none; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header className="tl-header" style={{ background: th.surface, borderBottom: `1px solid ${th.border}` }}>
        <div className="tl-logo">
          <div
            className="tl-logo-icon"
            style={{
              width: 42, height: 42,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              borderRadius: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
              boxShadow: "0 6px 14px rgba(37,99,235,0.28)",
              flexShrink: 0,
            }}
          >
            <FaStream size={18} />
          </div>
          <h2>
            Timeline <span style={{ color: "#2563eb" }}>View</span>
          </h2>
        </div>

        <div className="tl-header-actions">
          <button
            onClick={() => setSidebarOpen(true)}
            className="tl-btn"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", padding: "9px 14px", borderRadius: 11, fontSize: 12 }}
          >
            <FaDatabase size={12} />
            <span className="tl-datasets-label">Datasets</span>
            <span>({savedList.length})</span>
          </button>

          <div
            className="tl-toggle"
            onClick={() => setDark(!dark)}
            style={{ background: dark ? "#2563eb" : "#cbd5e1" }}
          >
            <div className="tl-toggle-knob" style={{ left: dark ? 30 : 3 }}>
              {dark ? <FaMoon color="#2563eb" size={10} /> : <FaSun color="#f59e0b" size={10} />}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, background: "#000", zIndex: 140, cursor: "pointer" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="tl-sidebar"
            style={{
              background: th.surface,
              borderRight: `1px solid ${th.border}`,
              boxShadow: "8px 0 28px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700 }}>
                <FaDatabase color="#2563eb" size={14} /> Saved Datasets
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: "transparent", border: "none", color: th.text, cursor: "pointer", display: "flex", padding: 4 }}
              >
                <FaTimes size={18} />
              </button>
            </div>
            <SavedDatasetsSidebar
              dark={dark}
              savedList={savedList}
              selectedTimeline={selectedTimeline}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              onOpen={openTimeline}
              onEdit={handleEditOpen}
              onDelete={handleDelete}
              th={th}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="tl-main">

        <div className="tl-card" style={{ background: th.surface, border: `1px solid ${th.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
          <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: "1.2rem", fontWeight: 700 }}>
            Upload &amp; Process Data
          </h2>
          <div className="tl-upload-row">
            <button
              onClick={() => fileRef.current.click()}
              className="tl-btn"
              style={{ background: "#2563eb" }}
            >
              <FaUpload size={13} /> Select CSV
            </button>
            <input type="file" accept=".csv" ref={fileRef} onChange={handleFile} hidden />

            {file && (
              <span
                className="tl-file-name"
                style={{
                  fontWeight: 600, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 6,
                  color: dark ? "#94a3b8" : "#475569",
                  flex: 1, minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <FaTable size={12} style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </span>
              </span>
            )}

            {csvText && (
              <button
                onClick={() => { setParsed(parseCSV(csvText)); setPreview(true); setGenerated(false); }}
                className="tl-btn"
                style={{ background: "#059669" }}
              >
                <FaTable size={13} /> Preview Table
              </button>
            )}
          </div>
        </div>

        {preview && !generated && (
          <div className="tl-card" style={{ background: th.surface, border: `1px solid ${th.border}` }}>
            <div
              className="tl-preview-header"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }}
            >
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: "1rem", fontWeight: 700 }}>
                <FaTable size={14} color="#2563eb" /> Data Preview
              </h3>
              <button
                onClick={() => { setGenerated(true); setSelectedTimeline(null); }}
                className="tl-btn tl-generate-btn"
                style={{ background: "#2563eb" }}
              >
                <FaChartBar size={13} /> Generate Timeline
              </button>
            </div>
            <div className="tl-table-wrap" style={{ border: `1px solid ${th.border}` }}>
              <table className="tl-table">
                <thead>
                  <tr style={{ background: dark ? "#1e293b" : "#f1f5f9" }}>
                    {["EVENT NAME", "DATE", "DESCRIPTION"].map((h) => (
                      <th key={h} style={{ color: th.text }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${th.border}` }}>
                      <td style={{ fontWeight: 600, color: th.text }}>{r.title}</td>
                      <td style={{ whiteSpace: "nowrap", color: th.text }}>{new Date(r.date).toLocaleDateString()}</td>
                      <td style={{ opacity: 0.72, minWidth: 140, color: th.text }}>{r.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {generated && (
          <div
            ref={timelineRef}
            className="tl-card"
            style={{ background: th.surface, border: `1px solid ${th.border}`, minHeight: 460 }}
          >
            <div className="tl-controls">
              <h2 className="tl-controls-title" style={{ color: th.text }}>
                <FaStream size={15} color="#2563eb" />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "42vw" }}>
                  {selectedTimeline?.name || datasetName || "Timeline"}
                </span>
              </h2>

              <div className="tl-zoom-group" style={{ background: dark ? "#1e293b" : "#f1f5f9" }}>
                {ZOOM_META.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setZoom(key)}
                    style={{
                      padding: "7px 12px",
                      border: "none",
                      borderRadius: 9,
                      cursor: "pointer",
                      background: zoom === key ? "#2563eb" : "transparent",
                      color: zoom === key ? "#fff" : th.text,
                      fontWeight: 600,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "background 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Icon size={10} /> {label}
                  </button>
                ))}
              </div>

              <div className="tl-view-group">
                <button
                  onClick={() => setView("horizontal")}
                  className="tl-btn"
                  style={{ background: view === "horizontal" ? "#2563eb" : "#94a3b8", padding: "9px 14px", borderRadius: 10, fontSize: 12 }}
                >
                  <FaArrowsAltH size={12} /> Horiz
                </button>
                <button
                  onClick={() => setView("vertical")}
                  className="tl-btn"
                  style={{ background: view === "vertical" ? "#2563eb" : "#94a3b8", padding: "9px 14px", borderRadius: 10, fontSize: 12 }}
                >
                  <FaArrowsAltV size={12} /> Vert
                </button>
                {!selectedTimeline && file && (
                  <button
                    onClick={handleSaveToDB}
                    className="tl-btn"
                    style={{ background: "#7c3aed", padding: "9px 14px", borderRadius: 10, fontSize: 12 }}
                  >
                    <FaSave size={12} /> Save
                  </button>
                )}
                <button
                  onClick={handleDownloadImage}
                  disabled={downloading}
                  className="tl-btn"
                  style={{
                    background: "#059669",
                    padding: "9px 14px",
                    borderRadius: 10,
                    fontSize: 12,
                    opacity: downloading ? 0.65 : 1,
                    cursor: downloading ? "not-allowed" : "pointer",
                  }}
                >
                  {downloading
                    ? <FaSpinner size={12} style={{ animation: "spin 1s linear infinite" }} />
                    : <FaDownload size={12} />
                  } Export
                </button>
              </div>
            </div>

            {zoom === "year" && (
              <div
                className="tl-year-hint"
                style={{
                  marginBottom: 14,
                  padding: "8px 13px",
                  borderRadius: 10,
                  background: dark ? "#1e293b" : "#eff6ff",
                  color: "#2563eb",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FaCalendarAlt size={11} /> Year view — tap dots to expand.
              </div>
            )}

            <div style={{
              overflowX: view === "horizontal" ? "auto" : "visible",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              width: "100%",
            }}
              className="tl-noscrollbar"
            >
              <TimelineRenderer
                events={events}
                zoom={zoom}
                view={view}
                dark={dark}
                yearGroups={yearGroups}
                onSelectEvent={setViewEvent}
                onSelectYear={setViewYearGroup}
              />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewEvent && (
          <EventDetailsModal event={viewEvent} dark={dark} zoom={zoom} onClose={() => setViewEvent(null)} />
        )}
        {viewYearGroup && (
          <YearGroupModal
            year={viewYearGroup.year}
            events={viewYearGroup.events}
            dark={dark}
            zoom={zoom}
            onClose={() => setViewYearGroup(null)}
            onSelectEvent={(ev) => setViewEvent(ev)}
          />
        )}
        {editTimeline && (
          <EditModal
            dark={dark}
            timeline={editTimeline}
            onClose={() => setEditTimeline(null)}
            onSaved={(updated) => {
              setSelectedTimeline(updated);
              fetchSaved();
              setEditTimeline(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}