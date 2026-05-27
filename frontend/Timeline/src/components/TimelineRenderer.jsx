import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt, FaExpandAlt, FaPencilAlt,
  FaTimes, FaSearch, FaUndo,
} from "react-icons/fa";
import { formatDate } from "../utils/helpers";
import { ALL_ICONS } from "../utils/eventIcons";
import { useEventIcon, useIconActions } from "../context/IconContext";

import TimelineCard from "./TimelineCard";
import YearDot from "./YearDot";

const GROUPS = ["All", ...Array.from(new Set(ALL_ICONS.map((i) => i.group)))];

function TimelineDotIconPicker({ event, dark, onClose }) {
  const [search, setSearch]           = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const { applyOverride, removeOverride } = useIconActions();

  const theme = dark
    ? { bg: "#1e293b", text: "#fff", sub: "#94a3b8", border: "#334155", input: "#0f172a", muted: "#475569" }
    : { bg: "#fff", text: "#111827", sub: "#64748b", border: "#e2e8f0", input: "#f8fafc", muted: "#94a3b8" };

  const filtered = ALL_ICONS.filter((ic) => {
    const q = search.toLowerCase().trim();
    return (activeGroup === "All" || ic.group === activeGroup) &&
           (!q || ic.label.toLowerCase().includes(q) || ic.key.includes(q));
  });

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }} />
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
          boxShadow: "0 32px 64px -12px rgba(0,0,0,0.4)", overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${dark ? "#2d3748" : "#f1f5f9"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: dark ? "#fff" : "#111827" }}>Choose Icon</div>
              <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
                for: <span style={{ color: "#2563eb", fontWeight: 600 }}>{event.title}</span>
                <span style={{ marginLeft: 8 }}>· {ALL_ICONS.length} icons</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: dark ? "#334155" : "#f1f5f9", border: "none", cursor: "pointer", color: dark ? "#94a3b8" : "#64748b", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaTimes size={13} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.input, borderRadius: 12, border: `1px solid ${theme.border}`, padding: "9px 14px", marginBottom: 14 }}>
            <FaSearch size={13} color={theme.muted} />
            <input
              autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons…"
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
              const count  = g === "All" ? ALL_ICONS.length : ALL_ICONS.filter((i) => i.group === g).length;
              const active = activeGroup === g;
              return (
                <button key={g} onClick={() => setActiveGroup(g)} style={{
                  padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                  whiteSpace: "nowrap", fontSize: 12, fontWeight: active ? 700 : 500,
                  background: active ? "linear-gradient(135deg, #2563eb, #7c3aed)" : (dark ? "#0f172a" : "#f1f5f9"),
                  color: active ? "#fff" : (dark ? "#94a3b8" : "#64748b"),
                  transition: "all 0.15s", flexShrink: 0,
                }}>
                  {g} <span style={{ marginLeft: 5, fontSize: 10, opacity: active ? 0.8 : 0.6 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: theme.muted, fontSize: 14 }}>No icons match "{search}"</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8 }}>
              {filtered.map((entry) => {
                const { Icon: EntryIcon, color: ec, key, label } = entry;
                return (
                  <button key={key} title={label}
                    onClick={() => { applyOverride(event._eid, key); onClose(); }}
                    style={{ borderRadius: 14, background: dark ? "#0f172a" : "#f8fafc", border: `1.5px solid ${dark ? "#1e293b" : "#e2e8f0"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", padding: "12px 4px 10px", transition: "transform 0.12s, background 0.12s, border-color 0.12s" }}
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
            onClick={(e) => { e.stopPropagation(); removeOverride(event._eid); onClose(); }}
            style={{ flex: 1, padding: "11px", borderRadius: 12, background: dark ? "#334155" : "#f1f5f9", border: "none", color: dark ? "#e2e8f0" : "#334155", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
          >
            <FaUndo size={11} /> Reset to auto
          </button>
          <button onClick={onClose} style={{ padding: "11px 18px", borderRadius: 12, background: dark ? "#1e293b" : "#e2e8f0", border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`, color: dark ? "#94a3b8" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
}

function VerticalEventRow({ ev, i, total, grouping, dateFormat, dark, onSelectEvent }) {
  const { Icon, color } = useEventIcon(ev);
  const [dotHovered, setDotHovered] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div style={{ display: "flex", gap: 20, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 44 }}>
        <div
          onMouseEnter={() => setDotHovered(true)}
          onMouseLeave={() => setDotHovered(false)}
          onClick={(e) => { e.stopPropagation(); setPickerOpen(true); }}
          style={{
            width: 44, height: 44, borderRadius: 13,
            background: `${color}18`, border: `2px solid ${color}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: `0 0 0 4px ${color}11`,
            position: "relative", overflow: "hidden", cursor: "pointer",
            transition: "box-shadow 0.15s, border-color 0.15s",
            zIndex: 1,
          }}
        >
          <Icon size={17} color={color} />
          <AnimatePresence>
            {dotHovered && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "absolute", inset: 0, background: dark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", color }}
              >
                <FaPencilAlt size={12} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {i !== total - 1 && (
          <div style={{ width: 2, flex: 1, background: `linear-gradient(${color}55, ${color}11)`, marginTop: 4, minHeight: 24 }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingBottom: i !== total - 1 ? 20 : 0 }}>
        <TimelineCard event={ev} grouping={grouping} dateFormat={dateFormat} dark={dark} onClick={() => onSelectEvent(ev)} />
      </div>

      <AnimatePresence>
        {pickerOpen && <TimelineDotIconPicker event={ev} dark={dark} onClose={() => setPickerOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

function YearEventCard({ ev, dark, dateFormat, onSelectEvent, isLast }) {
  const { Icon, color } = useEventIcon(ev);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelectEvent(ev)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        cursor: "pointer",
        borderRadius: 12,
        margin: "0 8px",
        marginBottom: isLast ? 8 : 6,
        border: `1px solid ${hovered ? color + "55" : (dark ? "#1e293b" : "#e8edf5")}`,
        background: hovered
          ? (dark ? `${color}0d` : `${color}06`)
          : (dark ? "#0f172a" : "#fafbfc"),
        transition: "all 0.18s ease",
        boxShadow: hovered
          ? `0 4px 16px ${color}18`
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 11,
        flexShrink: 0,
        marginTop: 1,
        background: `${color}18`,
        border: `1.5px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.18s",
        transform: hovered ? "scale(1.08)" : "scale(1)",
      }}>
        <Icon size={15} color={color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: "#2563eb",
          fontWeight: 700,
          fontSize: 10,
          marginBottom: 3,
          letterSpacing: "0.02em",
        }}>
          <FaCalendarAlt size={8} />
          {formatDate(ev.date, "month", dateFormat)}
        </div>
        <div style={{
          color: dark ? "#f1f5f9" : "#111827",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: 1.35,
          marginBottom: ev.description ? 4 : 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {ev.title}
        </div>
        {ev.description && (
          <div style={{
            color: dark ? "#94a3b8" : "#64748b",
            fontSize: 11,
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {ev.description}
          </div>
        )}
      </div>

      <FaExpandAlt
        size={10}
        color={color}
        style={{ opacity: hovered ? 0.7 : 0.3, flexShrink: 0, marginTop: 5, transition: "opacity 0.18s" }}
      />
    </motion.div>
  );
}

function YearSection({ year, events, dark, dateFormat, onSelectEvent, onSelectYear, isLast }) {
  const eventCount = events.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      style={{
        marginBottom: isLast ? 0 : 24,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${dark ? "#1e293b" : "#e2e8f0"}`,
        background: dark ? "#111827" : "#fff",
        boxShadow: dark
          ? "0 4px 20px rgba(0,0,0,0.25)"
          : "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <div
        onClick={() => onSelectYear({ year, events })}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
          background: "linear-gradient(135deg, #2563eb14, #7c3aed0a)",
          borderBottom: `1px solid ${dark ? "#1e293b" : "#eef2f7"}`,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          flexShrink: 0,
          color: "#fff",
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.1 }}>{year}</span>
          <span style={{ fontSize: 9, opacity: 0.8, fontWeight: 500, lineHeight: 1.2 }}>
            {eventCount} ev.
          </span>
        </div>

        <div style={{
          flex: 1,
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, #2563eb33, transparent)`,
        }} />

        <span style={{
          fontSize: 11,
          color: dark ? "#64748b" : "#94a3b8",
          fontWeight: 600,
          whiteSpace: "nowrap",
          padding: "4px 10px",
          borderRadius: 20,
          background: dark ? "#1e293b" : "#f1f5f9",
        }}>
          {eventCount} event{eventCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ padding: "10px 0 2px" }}>
        {events.map((ev, j) => (
          <YearEventCard
            key={ev._eid ?? ev.id ?? j}
            ev={ev}
            dark={dark}
            dateFormat={dateFormat}
            onSelectEvent={onSelectEvent}
            isLast={j === events.length - 1}
          />
        ))}
      </div>
    </motion.div>
  );
}

function HorizontalYearColumn({ year, events, dark, dateFormat, onSelectEvent, onSelectYear, isLast }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 280 }}>
        <YearDot
          year={year}
          count={events.length}
          dark={dark}
          onClick={() => onSelectYear({ year, events })}
        />

        <div style={{
          width: "100%",
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${dark ? "#1e293b" : "#e2e8f0"}`,
          background: dark ? "#111827" : "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}>
          {events.map((ev, j) => (
            <HorizontalYearEventRow
              key={ev._eid ?? ev.id ?? j}
              ev={ev}
              dark={dark}
              dateFormat={dateFormat}
              onSelectEvent={onSelectEvent}
              isLast={j === events.length - 1}
            />
          ))}
        </div>
      </div>

      {!isLast && (
        <div style={{
          width: 32,
          height: 3,
          flexShrink: 0,
          alignSelf: "flex-start",
          marginTop: 28,
          background: "linear-gradient(90deg, #2563eb55, #7c3aed55)",
          borderRadius: 10,
        }} />
      )}
    </div>
  );
}

function HorizontalYearEventRow({ ev, dark, dateFormat, onSelectEvent, isLast }) {
  const { Icon, color } = useEventIcon(ev);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelectEvent(ev)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        cursor: "pointer",
        transition: "background 0.15s",
        background: hovered ? (dark ? `${color}12` : `${color}08`) : "transparent",
        borderBottom: isLast ? "none" : `1px solid ${dark ? "#1e293b" : "#f1f5f9"}`,
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        flexShrink: 0,
        marginTop: 1,
        background: `${color}18`,
        border: `1.5px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Icon size={15} color={color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: "#2563eb",
          fontWeight: 700,
          fontSize: 10,
          marginBottom: 2,
        }}>
          <FaCalendarAlt size={8} /> {formatDate(ev.date, "month", dateFormat)}
        </div>
        <div style={{
          color: dark ? "#fff" : "#111827",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: 1.3,
          marginBottom: 2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {ev.title}
        </div>
        {ev.description && (
          <div style={{
            color: dark ? "#94a3b8" : "#64748b",
            fontSize: 11,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {ev.description}
          </div>
        )}
      </div>

      <FaExpandAlt size={10} color={color} style={{ opacity: 0.4, flexShrink: 0, marginTop: 4 }} />
    </div>
  );
}

const parseDate = (d) => {
  if (d instanceof Date) return d;
  const s = String(d);
  return s.includes("T") ? new Date(s) : new Date(s + "T00:00:00");
};

function EmptyState({ dark }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "64px 24px", gap: 12,
    }}>
      <div style={{ fontSize: 40 }}>📅</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#94a3b8" : "#64748b" }}>
        No valid timeline events found
      </div>
      <div style={{ fontSize: 13, color: dark ? "#475569" : "#94a3b8", textAlign: "center", maxWidth: 320 }}>
        Upload a CSV with name, date, and description columns to get started.
      </div>
    </div>
  );
}

export default function TimelineRenderer({
  events, grouping, view, dark, yearGroups, dateFormat, onSelectEvent, onSelectYear,
}) {
  const sortedEvents = [...events].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  if (!sortedEvents.length) return <EmptyState dark={dark} />;

  if (grouping === "year") {
    const years = Object.keys(yearGroups).sort((a, b) => Number(a) - Number(b));

    if (view === "horizontal") {
      return (
        <div style={{
          display: "flex",
          gap: 0,
          minWidth: "max-content",
          padding: "8px 8px 8px 0",
          alignItems: "flex-start",
        }}>
          {years.map((year, i) => {
            const yEvents = [...yearGroups[year]].sort((a, b) => parseDate(a.date) - parseDate(b.date));
            return (
              <HorizontalYearColumn
                key={year}
                year={year}
                events={yEvents}
                dark={dark}
                dateFormat={dateFormat}
                onSelectEvent={onSelectEvent}
                onSelectYear={onSelectYear}
                isLast={i === years.length - 1}
              />
            );
          })}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {years.map((year, i) => {
          const yEvents = [...yearGroups[year]].sort((a, b) => parseDate(a.date) - parseDate(b.date));
          return (
            <YearSection
              key={year}
              year={year}
              events={yEvents}
              dark={dark}
              dateFormat={dateFormat}
              onSelectEvent={onSelectEvent}
              onSelectYear={onSelectYear}
              isLast={i === years.length - 1}
            />
          );
        })}
      </div>
    );
  }

  if (view === "horizontal") {
    return (
      <div style={{
        display: "flex",
        gap: 20,
        minWidth: "max-content",
        padding: "8px 8px 8px 0",
        alignItems: "flex-start",
      }}>
        {sortedEvents.map((ev, i) => (
          <div key={ev._eid ?? ev.id ?? i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 280, flexShrink: 0 }}>
              <TimelineCard event={ev} grouping={grouping} dateFormat={dateFormat} dark={dark} onClick={() => onSelectEvent(ev)} />
            </div>
            {i !== sortedEvents.length - 1 && (
              <div style={{ width: 32, height: 3, flexShrink: 0, background: "linear-gradient(90deg, #2563eb55, #7c3aed55)", borderRadius: 10 }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {sortedEvents.map((ev, i) => (
        <VerticalEventRow
          key={ev._eid ?? ev.id ?? i}
          ev={ev} i={i} total={sortedEvents.length}
          grouping={grouping} dateFormat={dateFormat} dark={dark}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </div>
  );
}