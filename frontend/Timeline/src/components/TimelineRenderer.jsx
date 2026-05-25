import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPencilAlt, FaTimes, FaSearch, FaUndo,
} from "react-icons/fa";

import TimelineCard from "./TimelineCard";
import YearDot from "./YearDot";
import { useEventIcon, useIconActions } from "../context/IconContext";
import { ALL_ICONS } from "../utils/eventIcons";

const GROUPS = ["All", ...Array.from(new Set(ALL_ICONS.map((i) => i.group)))];

function TimelineDotIconPicker({ event, dark, onClose }) {
  const [search, setSearch]           = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const { applyOverride, removeOverride } = useIconActions();

  const theme = dark
    ? { bg: "#1e293b", text: "#fff", sub: "#94a3b8", border: "#334155",
        input: "#0f172a", muted: "#475569" }
    : { bg: "#fff", text: "#111827", sub: "#64748b", border: "#e2e8f0",
        input: "#f8fafc", muted: "#94a3b8" };

  const filtered = ALL_ICONS.filter((ic) => {
    const q = search.toLowerCase().trim();
    const groupOk = activeGroup === "All" || ic.group === activeGroup;
    const searchOk = !q || ic.label.toLowerCase().includes(q) || ic.key.includes(q);
    return groupOk && searchOk;
  });

  const handleSelect = (entry) => {
    applyOverride(event._eid, entry.key);
    onClose();
  };

  const handleReset = (e) => {
    e.stopPropagation();
    removeOverride(event._eid);
    onClose();
  };

  return (
    <>
\      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(15,23,42,0.5)",
          backdropFilter: "blur(6px)",
        }}
      />

      <motion.div
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
          fontFamily: "'Inter', sans-serif",
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
              onClick={onClose}
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

          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
            {GROUPS.map((g) => {
              const count = g === "All" ? ALL_ICONS.length : ALL_ICONS.filter((i) => i.group === g).length;
              const active = activeGroup === g;
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  style={{
                    padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                    whiteSpace: "nowrap", fontSize: 12, fontWeight: active ? 700 : 500,
                    background: active ? "linear-gradient(135deg, #2563eb, #7c3aed)" : (dark ? "#0f172a" : "#f1f5f9"),
                    color: active ? "#fff" : (dark ? "#94a3b8" : "#64748b"),
                    transition: "all 0.15s", flexShrink: 0,
                  }}
                >
                  {g} <span style={{ marginLeft: 5, fontSize: 10, opacity: active ? 0.8 : 0.6 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
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
                    title={label}
                    onClick={() => handleSelect(entry)}
                    style={{
                      borderRadius: 14, background: dark ? "#0f172a" : "#f8fafc",
                      border: `1.5px solid ${dark ? "#1e293b" : "#e2e8f0"}`,
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", gap: 6, cursor: "pointer", padding: "12px 4px 10px",
                      transition: "transform 0.12s, background 0.12s, border-color 0.12s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${ec}15`; e.currentTarget.style.borderColor = ec; e.currentTarget.style.transform = "scale(1.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = dark ? "#0f172a" : "#f8fafc"; e.currentTarget.style.borderColor = dark ? "#1e293b" : "#e2e8f0"; e.currentTarget.style.transform = "scale(1)"; }}
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
              flex: 1, padding: "11px", borderRadius: 12,
              background: dark ? "#334155" : "#f1f5f9",
              border: "none", color: dark ? "#e2e8f0" : "#334155",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}
          >
            <FaUndo size={11} /> Reset to auto
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "11px 18px", borderRadius: 12,
              background: dark ? "#1e293b" : "#e2e8f0",
              border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
              color: dark ? "#94a3b8" : "#64748b",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
}

function VerticalEventRow({ ev, i, total, zoom, dark, onSelectEvent }) {
  const { Icon, color }   = useEventIcon(ev);
  const [dotHovered, setDotHovered] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div style={{ display: "flex", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

        <div
          onMouseEnter={() => setDotHovered(true)}
          onMouseLeave={() => setDotHovered(false)}
          onClick={(e) => { e.stopPropagation(); setPickerOpen(true); }}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${color}18`,
            border: `2px solid ${color}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 0 0 4px ${color}11`,
            position: "relative", overflow: "hidden",
            cursor: "pointer",
            transition: "box-shadow 0.15s, border-color 0.15s",
          }}
        >
          <Icon size={17} color={color} />

          <AnimatePresence>
            {dotHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute", inset: 0,
                  background: dark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: color,
                }}
              >
                <FaPencilAlt size={12} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {i !== total - 1 && (
          <div style={{
            width: 2, flex: 1,
            background: `linear-gradient(${color}44, transparent)`,
            marginTop: 4,
          }} />
        )}
      </div>

      <div style={{ paddingBottom: 48, flex: 1 }}>
        <TimelineCard
          event={ev}
          zoom={zoom}
          dark={dark}
          onClick={() => onSelectEvent(ev)}
        />
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <TimelineDotIconPicker
            event={ev}
            dark={dark}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const parseDate = (d) => {
  if (d instanceof Date) return d;
  const s = String(d);
  return s.includes("T") ? new Date(s) : new Date(s + "T00:00:00");
};

export default function TimelineRenderer({
  events,
  zoom,
  view,
  dark,
  yearGroups,
  onSelectEvent,
  onSelectYear,
}) {
  const sortedEvents = [...events].sort(
    (a, b) => parseDate(a.date) - parseDate(b.date)
  );

  if (zoom === "year") {
    const years = Object.keys(yearGroups).sort((a, b) => Number(a) - Number(b));

    if (view === "horizontal") {
      return (
        <div style={{
          display: "flex", gap: 60,
          minWidth: "max-content",
          padding: "30px 10px",
          alignItems: "center",
        }}>
          {years.map((year, i) => (
            <div key={year} style={{ display: "flex", alignItems: "center", gap: 60 }}>
              <YearDot
                year={year}
                count={yearGroups[year].length}
                dark={dark}
                onClick={() => onSelectYear({
                  year,
                  events: [...yearGroups[year]].sort((a, b) => parseDate(a.date) - parseDate(b.date)),
                })}
              />
              {i !== years.length - 1 && (
                <div style={{
                  minWidth: 60, height: 4,
                  background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                  borderRadius: 10, opacity: 0.3,
                }} />
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingLeft: 20 }}>
        {years.map((year, i) => (
          <div key={year} style={{ display: "flex", gap: 35, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ marginTop: 4 }}>
                <YearDot
                  year={year}
                  count={yearGroups[year].length}
                  dark={dark}
                  onClick={() => onSelectYear({
                    year,
                    events: [...yearGroups[year]].sort((a, b) => parseDate(a.date) - parseDate(b.date)),
                  })}
                />
              </div>
              {i !== years.length - 1 && (
                <div style={{
                  width: 4, height: 60,
                  background: "linear-gradient(#2563eb22, transparent)",
                  marginTop: 8,
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view === "horizontal") {
    return (
      <div style={{
        display: "flex", gap: 40,
        minWidth: "max-content",
        padding: "20px 10px",
      }}>
        {sortedEvents.map((ev, i) => (
          <div key={ev._eid ?? ev.id ?? i} style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <TimelineCard
              event={ev}
              zoom={zoom}
              dark={dark}
              onClick={() => onSelectEvent(ev)}
            />
            {i !== sortedEvents.length - 1 && (
              <div style={{
                minWidth: 60, height: 4,
                background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                borderRadius: 10, opacity: 0.3,
              }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingLeft: 20 }}>
      {sortedEvents.map((ev, i) => (
        <VerticalEventRow
          key={ev._eid ?? ev.id ?? i}
          ev={ev}
          i={i}
          total={sortedEvents.length}
          zoom={zoom}
          dark={dark}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </div>
  );
}