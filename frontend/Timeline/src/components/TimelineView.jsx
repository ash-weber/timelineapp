import { useState, useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FaMoon, FaSun, FaStream, FaUpload, FaSave,
  FaTable, FaChartBar, FaArrowsAltH, FaArrowsAltV,
  FaCalendarAlt,
  FaDownload, FaSpinner, FaDatabase, FaTimes, FaQuestionCircle,
  FaPencilAlt, FaSearch, FaUndo, FaExclamationTriangle,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import Papa from "papaparse";

import { API } from "../constants";
import { applyColumnMapping as _applyColumnMapping, groupEventsByYear, formatDate, validateCSVEvents } from "../utils/helpers";
import { getOrDeviceMac } from "../utils/deviceMac";
import { IconProvider } from "../context/IconContext";
import { ALL_ICONS, getEventIcon } from "../utils/eventIcons";

import SavedDatasetsSidebar from "./SavedDatasetsSidebar";
import TimelineRenderer from "./TimelineRenderer";
import EventDetailsModal from "./EventDetailsModal";
import YearGroupModal from "./YearGroupModal";
import EditModal from "./EditModal";
import HelpPage from "./HelpPage";
import ColumnMapper from "./ColumnMapper";

function applyColumnMapping(rows, mapping) {
  const cleanRows = rows.map((row) => {
    const clean = {};
    Object.keys(row).forEach((k) => { clean[k.trim()] = row[k]; });
    return clean;
  });
  return _applyColumnMapping(cleanRows, mapping);
}

const DATE_FORMATS = [
  { value: "YYYY",        label: "YYYY" },
  { value: "MON-YYYY",    label: "MON-YYYY" },
  { value: "DD-MON-YYYY", label: "DD-MON-YYYY" },
];

const ICON_GROUPS = ["All", ...Array.from(new Set(ALL_ICONS.map((i) => i.group)))];

function renderIconToCanvas(ctx, IconComponent, color, cx, cy, iconSize) {
  return new Promise((resolve) => {
    try {
      const rawSvg = renderToStaticMarkup(<IconComponent color={color} size={iconSize} />);
      const svgWithNs = rawSvg.includes("xmlns")
        ? rawSvg
        : rawSvg.replace("<svg", `<svg xmlns="http://www.w3.org/2000/svg"`);
      const blob = new Blob([svgWithNs], { type: "image/svg+xml;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const img  = new Image();
      img.onload = () => {
        ctx.drawImage(img, cx - iconSize / 2, cy - iconSize / 2, iconSize, iconSize);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        ctx.beginPath();
        ctx.arc(cx, cy, iconSize / 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        resolve();
      };
      img.src = url;
    } catch { resolve(); }
  });
}

export default function TimelineView() {
  const [dark, setDark]                   = useState(false);
  const [file, setFile]                   = useState(null);
  const [parsed, setParsed]               = useState([]);
  const [preview, setPreview]             = useState(false);
  const [datasetName, setDatasetName]     = useState("");
  const [generated, setGenerated]         = useState(false);
  const [grouping, setGrouping]           = useState("month");
  const [view, setView]                   = useState("vertical");
  const [dateFormat, setDateFormat]       = useState("MON-YYYY");
  const [savedList, setSavedList]         = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [editTimeline, setEditTimeline]   = useState(null);
  const [viewEvent, setViewEvent]         = useState(null);
  const [viewYearGroup, setViewYearGroup] = useState(null);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [downloading, setDownloading]     = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [helpOpen, setHelpOpen]           = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const [csvHeaders, setCsvHeaders]     = useState([]);
  const [csvRawRows, setCsvRawRows]     = useState([]);
  const [showMapper, setShowMapper]     = useState(false);
  const [needsMapping, setNeedsMapping] = useState(false);

  
  const [fileReady, setFileReady]       = useState(false);
  const [previewed, setPreviewed]       = useState(false);

  const [logoHovered, setLogoHovered]       = useState(false);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [logoIconKey, setLogoIconKey]       = useState(null);
  const [logoSearch, setLogoSearch]         = useState("");
  const [logoGroup, setLogoGroup]           = useState("All");

  const fileRef         = useRef();
  const timelineRef     = useRef();
  const timelineBodyRef = useRef();

  const th = dark
    ? { bg: "#0a0f1e", surface: "#111827", text: "#fff", border: "#334155" }
    : { bg: "#f1f5f9", surface: "#fff", text: "#111827", border: "#e2e8f0" };

  useEffect(() => { fetchSaved(); }, []);

  const fetchSaved = async () => {
    try {
      const mac = getOrDeviceMac();
      const res = await fetch(`${API}/datasets`, { method: "GET", headers: { "x-device-mac": mac } });
      const data = await res.json();
      if (data.success) setSavedList(data.datasets);
    } catch (err) { console.error("fetchSaved error:", err); }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!f.name.endsWith(".csv")) {
      setValidationErrors(["Only CSV files are supported."]);
      return;
    }

    setFile(f);
    setDatasetName(f.name.replace(".csv", ""));
    setNeedsMapping(false);
    setValidationErrors([]);
    setPreview(false);
    setPreviewed(false);
    setFileReady(false);
    setGenerated(false);
    setSelectedTimeline(null);
    setParsed([]);
    setShowMapper(false);

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      preview: 10,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];

        if (headers.length === 0) {
          setValidationErrors(["The CSV file appears to be empty or has no headers."]);
          return;
        }

        setCsvHeaders(headers);
        setCsvRawRows(results.data || []);

        const NAME_KEYS  = ["name", "title", "event", "event name", "label", "summary"];
        const DATE_KEYS  = ["date", "time", "when", "timestamp", "day", "datetime"];
        const DESC_KEYS  = ["description", "desc", "details", "detail", "note", "notes", "info", "body", "content", "text"];

        const nameCol = headers.find((h) => NAME_KEYS.includes(h.toLowerCase().trim()));
        const dateCol = headers.find((h) => DATE_KEYS.includes(h.toLowerCase().trim()));
        const descCol = headers.find((h) => DESC_KEYS.includes(h.toLowerCase().trim()));

        const canAutoMap = !!(nameCol && dateCol);

        if (canAutoMap) {
          setNeedsMapping(false);
          Papa.parse(f, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
            complete: (fullResults) => {
              const autoMapping = {
                name:        nameCol.trim(),
                date:        dateCol.trim(),
                description: descCol ? descCol.trim() : "",
              };
              const mapped = applyColumnMapping(fullResults.data, autoMapping);
              const { valid, errors } = validateCSVEvents(mapped);

              if (valid.length === 0) {
                setValidationErrors(errors.length > 0 ? errors : ["No valid timeline events found in this file."]);
                return;
              }
              if (errors.length > 0) setValidationErrors(errors);

              setParsed(valid);
              setShowMapper(false);
              setFileReady(true);
            },
          });
        } else {
          setNeedsMapping(true);
          setShowMapper(true);
          setFileReady(false);
        }
      },
    });
  };

  const handleMappingConfirm = (mapping) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const normMapping = {
          name:        (mapping.name        || "").trim(),
          date:        (mapping.date        || "").trim(),
          description: (mapping.description || "").trim(),
        };

        if (!normMapping.name || !normMapping.date) {
          setValidationErrors(["Please map at least the Name and Date columns."]);
          return;
        }

        const mapped = applyColumnMapping(results.data, normMapping);
        const { valid, errors } = validateCSVEvents(mapped);

        if (valid.length === 0) {
          setValidationErrors(errors.length > 0 ? errors : ["No valid timeline events found after mapping."]);
          return;
        }
        if (errors.length > 0) setValidationErrors(errors);
        else setValidationErrors([]);

        setParsed(valid);
        setShowMapper(false);
        setFileReady(true);
        setPreviewed(false);
        setPreview(false);
        setGenerated(false);
        setSelectedTimeline(null);
      },
    });
  };

  const handleSaveToDB = async () => {
    if (!file || parsed.length === 0) return;
    const name = window.prompt("Enter a name for this timeline dataset:", datasetName || "");
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    const isDuplicate = savedList.some((item) => item.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) { alert("Dataset name already exists. Please choose a different name."); return; }
    setDatasetName(trimmedName);
    try {
      const mac = getOrDeviceMac();
      const res = await fetch(`${API}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-device-mac": mac },
        body: JSON.stringify({ name: trimmedName, events: parsed }),
      });
      if ((await res.json()).success) { alert("Timeline Saved!"); fetchSaved(); }
    } catch { alert("Save failed"); }
  };

  const handleDownloadImage = async () => {
    if (!events || events.length === 0) return;
    setDownloading(true);
    try {
      const DPR          = 2;
      const OUTER_PAD    = 48;
      const COL_GAP      = 40;
      const CARD_W       = 340;
      const CARD_H_BASE  = 108;
      const CARD_GAP     = 14;
      const DOT_R        = 14;
      const DOT_OFFSET   = DOT_R + 8;
      const CARD_OFFSET  = DOT_OFFSET + DOT_R + 16;
      const COL_W        = CARD_OFFSET + CARD_W;
      const TITLE_H      = 80;
      const FOOTER_H     = 36;
      const MAX_COL_H    = 2400;
      const timelineName = selectedTimeline?.name || datasetName || "Timeline";

      const tempCanvas  = document.createElement("canvas");
      const tempCtx     = tempCanvas.getContext("2d");
      tempCtx.font      = "400 12px Inter, sans-serif";

      const cardHeights = events.map((ev) => {
        const words = (ev.description || "").split(" ");
        let lines = 1, line = "";
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (tempCtx.measureText(test).width > CARD_W - 28 && line) { lines++; line = word; }
          else { line = test; }
        }
        const clampedLines = Math.min(lines, 3);
        const descHeight = clampedLines * 16;
        return Math.max(CARD_H_BASE, 14 + 19 + 17 + descHeight + 14);
      });

      const maxCardH     = Math.max(...cardHeights);
      const rowH         = maxCardH + CARD_GAP;
      const ROWS_PER_COL = Math.max(1, Math.floor(MAX_COL_H / rowH));
      const NUM_COLS     = Math.ceil(events.length / ROWS_PER_COL);
      const tallestCol   = Math.min(events.length, ROWS_PER_COL);
      const totalW       = OUTER_PAD + NUM_COLS * COL_W + (NUM_COLS - 1) * COL_GAP + OUTER_PAD;
      const totalH       = OUTER_PAD + TITLE_H + tallestCol * rowH + FOOTER_H + OUTER_PAD;

      const canvas  = document.createElement("canvas");
      canvas.width  = totalW * DPR;
      canvas.height = totalH * DPR;
      const ctx     = canvas.getContext("2d");
      ctx.scale(DPR, DPR);

      const bgColor   = dark ? "#0f172a" : "#f8fafc";
      const textColor = dark ? "#f1f5f9" : "#111827";
      const subColor  = dark ? "#94a3b8" : "#64748b";
      const cardBg    = dark ? "#1e293b" : "#ffffff";
      const cardBdr   = dark ? "#334155" : "#e2e8f0";
      const accentClr = "#2563eb";

      const trunc = (text, maxW) => {
        if (ctx.measureText(text).width <= maxW) return text;
        let lo = 0, hi = text.length;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          ctx.measureText(text.slice(0, mid) + "…").width <= maxW ? (lo = mid) : (hi = mid - 1);
        }
        return text.slice(0, lo) + "…";
      };

      const roundRect = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalW, totalH);

      for (let c = 0; c < NUM_COLS; c++) {
        const colX = OUTER_PAD + c * (COL_W + COL_GAP);
        ctx.fillStyle = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)";
        roundRect(colX - 8, OUTER_PAD + TITLE_H - 8, COL_W + 16, tallestCol * rowH + 16, 16);
        ctx.fill();
      }

      const titleGrad = ctx.createLinearGradient(OUTER_PAD, 0, OUTER_PAD + 300, 0);
      titleGrad.addColorStop(0, "#2563eb");
      titleGrad.addColorStop(1, "#7c3aed");
      roundRect(OUTER_PAD, OUTER_PAD, 10, 44, 3);
      ctx.fillStyle = titleGrad;
      ctx.fill();
      ctx.font = "700 26px Inter, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textBaseline = "middle";
      ctx.fillText(timelineName, OUTER_PAD + 22, OUTER_PAD + 22);
      ctx.font = "400 13px Inter, sans-serif";
      ctx.fillStyle = subColor;
      ctx.textBaseline = "top";
      ctx.fillText(
        `${events.length} events · ${grouping} grouping · ${dateFormat} · ${view} · ${NUM_COLS} column${NUM_COLS > 1 ? "s" : ""}`,
        OUTER_PAD + 22, OUTER_PAD + 50
      );

      if (NUM_COLS > 1) {
        for (let c = 0; c < NUM_COLS; c++) {
          const colX  = OUTER_PAD + c * (COL_W + COL_GAP);
          const start = c * ROWS_PER_COL + 1;
          const end   = Math.min((c + 1) * ROWS_PER_COL, events.length);
          ctx.font = "600 11px Inter, sans-serif";
          ctx.fillStyle = dark ? "#475569" : "#94a3b8";
          ctx.textBaseline = "top";
          ctx.fillText(`Events ${start}–${end}`, colX + DOT_OFFSET + DOT_R + 16, OUTER_PAD + TITLE_H - 20);
        }
      }

      for (let i = 0; i < events.length; i++) {
        const ev     = events[i];
        const CARD_H = cardHeights[i];
        const col    = Math.floor(i / ROWS_PER_COL);
        const row    = i % ROWS_PER_COL;
        const colX   = OUTER_PAD + col * (COL_W + COL_GAP);
        const dotX   = colX + DOT_OFFSET;
        const cardX  = colX + CARD_OFFSET;
        const cardY  = OUTER_PAD + TITLE_H + row * rowH;
        const dotY   = cardY + CARD_H / 2;

        if (
          row < ROWS_PER_COL - 1 && i < events.length - 1 &&
          Math.floor((i + 1) / ROWS_PER_COL) === col
        ) {
          const nextDotY = dotY + rowH;
          const lineGrad = ctx.createLinearGradient(dotX, dotY, dotX, nextDotY);
          lineGrad.addColorStop(0, "#2563eb66");
          lineGrad.addColorStop(1, "#7c3aed33");
          ctx.strokeStyle = lineGrad;
          ctx.lineWidth   = 2.5;
          ctx.beginPath();
          ctx.moveTo(dotX, dotY + DOT_R + 2);
          ctx.lineTo(dotX, nextDotY - DOT_R - 2);
          ctx.stroke();
        }

        const { Icon: EvIcon, color: evColor } = getEventIcon(ev);
        ctx.beginPath(); ctx.arc(dotX, dotY, DOT_R + 5, 0, Math.PI * 2); ctx.fillStyle = `${evColor}20`; ctx.fill();
        ctx.beginPath(); ctx.arc(dotX, dotY, DOT_R, 0, Math.PI * 2);     ctx.fillStyle = `${evColor}33`; ctx.fill();
        ctx.beginPath(); ctx.arc(dotX, dotY, DOT_R, 0, Math.PI * 2);     ctx.strokeStyle = `${evColor}88`; ctx.lineWidth = 1.5; ctx.stroke();
        await renderIconToCanvas(ctx, EvIcon, evColor, dotX, dotY, 16);

        ctx.shadowColor   = dark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.08)";
        ctx.shadowBlur    = 10; ctx.shadowOffsetY = 3;
        roundRect(cardX, cardY, CARD_W, CARD_H, 12);
        ctx.fillStyle = cardBg; ctx.fill();
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = cardBdr; ctx.lineWidth = 1; ctx.stroke();

        const accentGrad = ctx.createLinearGradient(cardX, 0, cardX + CARD_W, 0);
        accentGrad.addColorStop(0, evColor); accentGrad.addColorStop(1, "#7c3aed");
        ctx.fillStyle = accentGrad;
        ctx.fillRect(cardX, cardY, CARD_W, 3);

        const dateStr = ev.date ? formatDate(ev.date, grouping, dateFormat) : "";
        ctx.font = "600 11px Inter, sans-serif"; ctx.fillStyle = accentClr;
        ctx.textBaseline = "top";
        ctx.fillText(dateStr, cardX + 14, cardY + 14);

        const title = ev.title || ev.name || "Untitled";
        ctx.font = "700 14px Inter, sans-serif"; ctx.fillStyle = textColor;
        ctx.fillText(trunc(title, CARD_W - 28), cardX + 14, cardY + 33);

        ctx.font = "400 12px Inter, sans-serif"; ctx.fillStyle = subColor;
        const words = (ev.description || "").split(" ");
        let line = "", descY = cardY + 56, lineCount = 0;
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (ctx.measureText(test).width > CARD_W - 28 && line) {
            if (lineCount >= 2) { ctx.fillText(line + "…", cardX + 14, descY); break; }
            ctx.fillText(line, cardX + 14, descY);
            line = word; descY += 16; lineCount++;
            if (descY > cardY + CARD_H - 10) { ctx.fillText(line + "…", cardX + 14, descY - 16); break; }
          } else { line = test; }
        }
        if (line && descY <= cardY + CARD_H - 10 && lineCount < 3) ctx.fillText(line, cardX + 14, descY);
      }

      ctx.fillStyle = dark ? "#1e293b" : "#e2e8f0";
      ctx.fillRect(0, totalH - FOOTER_H, totalW, FOOTER_H);
      ctx.font = "400 11px Inter, sans-serif"; ctx.fillStyle = dark ? "#475569" : "#94a3b8";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        `Timeline View · ${timelineName} · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        OUTER_PAD, totalH - 12
      );

      const link    = document.createElement("a");
      link.download = `${timelineName.replace(/\s+/g, "_")}.png`;
      link.href     = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed. See console for details.");
    } finally { setDownloading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timeline?")) return;
    try {
      const mac = getOrDeviceMac();
      await fetch(`${API}/delete/${id}`, { method: "DELETE", headers: { "x-device-mac": mac } });
      fetchSaved();
      if (selectedTimeline?.id === id) setGenerated(false);
      setDropdownOpen(false);
    } catch (err) { console.error("Delete error:", err); }
  };

  const openTimeline = async (item) => {
    try {
      const mac = getOrDeviceMac();
      const res = await fetch(`${API}/get/name/${encodeURIComponent(item.name)}`, {
        method: "GET", headers: { "x-device-mac": mac },
      });
      const data = await res.json();
      if (!data.success) { alert(data.error || "Unauthorized Access"); return null; }
      const formatted = data.data.map((e) => ({
        ...e, _eid: `db_${e.id}`, title: e.title || e.name, date: new Date(e.date),
      }));
      setSelectedTimeline({ ...item, events: formatted });
      setGenerated(true); setPreview(false); setDropdownOpen(false); setSidebarOpen(false);
      return formatted;
    } catch (err) { console.error("openTimeline error:", err); return null; }
  };

  const handleEditOpen = async (item) => {
    const fetchedEvents = await openTimeline(item);
    if (fetchedEvents) setEditTimeline({ ...item, events: fetchedEvents });
  };

  const filteredLogoIcons = ALL_ICONS.filter((ic) => {
    const q = logoSearch.toLowerCase().trim();
    return (logoGroup === "All" || ic.group === logoGroup) &&
           (!q || ic.label.toLowerCase().includes(q) || ic.key.includes(q));
  });

  const currentLogoEntry = logoIconKey ? ALL_ICONS.find((i) => i.key === logoIconKey) : null;
  const LogoIcon = currentLogoEntry ? currentLogoEntry.Icon : FaStream;

  const openLogoPicker = (e) => {
    e.stopPropagation();
    setLogoSearch(""); setLogoGroup("All"); setLogoPickerOpen(true);
  };

  const events     = selectedTimeline ? selectedTimeline.events : parsed;
  const yearGroups = groupEventsByYear(events);

  if (helpOpen) {
    return (
      <AnimatePresence mode="wait">
        <HelpPage key="help" dark={dark} onBack={() => setHelpOpen(false)} />
      </AnimatePresence>
    );
  }

  return (
    <IconProvider>
      <div style={{
        minHeight: "100vh", background: th.bg, color: th.text,
        transition: "background 0.4s, color 0.4s",
        fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden",
      }}>
        <style>{`
          * { box-sizing: border-box; }
          .tl-header { display: flex; justify-content: space-between; align-items: center; padding: 0 32px; height: 72px; position: sticky; top: 0; z-index: 100; }
          .tl-logo { display: flex; align-items: center; gap: 12px; }
          .tl-logo h2 { margin: 0; font-size: 1.25rem; letter-spacing: -0.5px; white-space: nowrap; }
          .tl-header-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
          .tl-main { padding: 28px 32px 48px; }
          .tl-card { border-radius: 20px; padding: 28px; margin-bottom: 24px; }
          .tl-btn { display: inline-flex; align-items: center; gap: 7px; padding: 11px 20px; border: none; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; color: #fff; transition: opacity 0.18s, transform 0.15s; white-space: nowrap; }
          .tl-btn:hover { opacity: 0.87; transform: translateY(-1px); }
          .tl-btn:active { transform: translateY(0); opacity: 1; }
          .tl-upload-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
          .tl-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
          .tl-controls-title { font-size: 1.05rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .tl-controls-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .tl-seg-group { display: flex; gap: 2px; padding: 3px; border-radius: 10px; }
          .tl-seg-btn { padding: 6px 11px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 11px; display: flex; align-items: center; gap: 4px; transition: background 0.18s, color 0.18s; white-space: nowrap; }
          .tl-table-wrap { overflow-x: auto; border-radius: 14px; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
          .tl-table { width: 100%; border-collapse: collapse; min-width: 440px; }
          .tl-table th { padding: 11px 14px; text-align: left; font-size: 11px; letter-spacing: 0.05em; font-weight: 700; }
          .tl-table td { padding: 11px 14px; font-size: 13px; }
          .tl-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 340px; z-index: 150; padding: 28px 22px; overflow-y: auto; }
          .tl-toggle { width: 54px; height: 27px; border-radius: 20px; cursor: pointer; position: relative; padding: 3px; transition: background 0.3s; flex-shrink: 0; }
          .tl-toggle-knob { width: 21px; height: 21px; background: #fff; border-radius: 50%; position: absolute; top: 3px; transition: left 0.3s cubic-bezier(0.4,0,0.2,1); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
          .tl-logo-icon-wrap { position: relative; display: inline-flex; }
          .tl-logo-edit-btn { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; padding: 0; transition: opacity 0.15s, transform 0.15s; }
          .tl-logo-edit-btn:hover { transform: scale(1.15); }
          .logo-picker-scroll::-webkit-scrollbar { width: 5px; }
          .logo-picker-scroll::-webkit-scrollbar-thumb { border-radius: 10px; }
          .logo-group-scroll::-webkit-scrollbar { display: none; }
          .logo-icon-btn { transition: transform 0.12s, background 0.12s, border-color 0.12s; cursor: pointer; }
          .logo-icon-btn:hover { transform: scale(1.08); }
          .tl-fmt-select { padding: 7px 10px; border-radius: 9px; border: 1px solid; font-weight: 600; font-size: 11px; cursor: pointer; outline: none; }
          .tl-errors { border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
          .tl-error-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; }
          @media (max-width: 640px) {
            .tl-header { padding: 0 14px; height: 58px; }
            .tl-logo-icon { width: 34px !important; height: 34px !important; border-radius: 10px !important; }
            .tl-logo h2 { font-size: 0.95rem; }
            .tl-datasets-label { display: none; }
            .tl-help-label { display: none; }
            .tl-main { padding: 12px 12px 40px; }
            .tl-card { padding: 16px 14px; border-radius: 15px; margin-bottom: 14px; }
            .tl-card h2 { font-size: 1.05rem !important; margin-bottom: 14px !important; }
            .tl-card h3 { font-size: 0.95rem !important; }
            .tl-upload-row { flex-direction: column; align-items: stretch; }
            .tl-upload-row .tl-btn { width: 100%; justify-content: center; }
            .tl-file-name { font-size: 12px !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .tl-controls { flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
            .tl-controls-right { width: 100%; }
            .tl-seg-group { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
            .tl-seg-group::-webkit-scrollbar { display: none; }
            .tl-seg-btn { flex-shrink: 0; }
            .tl-sidebar { width: 100% !important; border-right: none !important; }
            .logo-picker-panel { width: 96vw !important; max-height: 90vh !important; }
            .tl-fmt-select { width: 100%; }
          }
          @media (min-width: 641px) and (max-width: 1024px) {
            .tl-header { padding: 0 22px; height: 66px; }
            .tl-main { padding: 20px 22px 40px; }
            .tl-card { padding: 22px; }
            .tl-sidebar { width: 300px; }
          }
          .tl-noscrollbar::-webkit-scrollbar { display: none; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>

        <header className="tl-header" style={{ background: th.surface, borderBottom: `1px solid ${th.border}` }}>
          <div className="tl-logo">
            <div className="tl-logo-icon-wrap" onMouseEnter={() => setLogoHovered(true)} onMouseLeave={() => setLogoHovered(false)}>
              <div
                className="tl-logo-icon"
                onClick={openLogoPicker}
                title="Click to change icon"
                style={{ width: 42, height: 42, background: "linear-gradient(135deg, #2563eb, #7c3aed)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 6px 14px rgba(37,99,235,0.28)", flexShrink: 0, cursor: "pointer" }}
              >
                <LogoIcon size={18} />
              </div>
              <AnimatePresence>
                {logoHovered && (
                  <motion.button
                    className="tl-logo-edit-btn"
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }}
                    onClick={openLogoPicker} title="Change icon"
                    style={{ background: dark ? "#1e293b" : "#fff", border: `1.5px solid ${th.border}`, color: "#2563eb", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                  >
                    <FaPencilAlt size={9} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <h2>Timeline <span style={{ color: "#2563eb" }}>View</span></h2>
          </div>

          <div className="tl-header-actions">
            <button onClick={() => setHelpOpen(true)} className="tl-btn"
              style={{ background: dark ? "#334155" : "#e2e8f0", color: th.text, padding: "9px 14px", borderRadius: 11, fontSize: 12 }}>
              <FaQuestionCircle size={13} />
              <span className="tl-help-label">Help</span>
            </button>
            <button onClick={() => setSidebarOpen(true)} className="tl-btn"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", padding: "9px 14px", borderRadius: 11, fontSize: 12 }}>
              <FaDatabase size={12} />
              <span className="tl-datasets-label">Datasets</span>
              <span>({savedList.length})</span>
            </button>
            <div className="tl-toggle" onClick={() => setDark(!dark)} style={{ background: dark ? "#2563eb" : "#cbd5e1" }}>
              <div className="tl-toggle-knob" style={{ left: dark ? 30 : 3 }}>
                {dark ? <FaMoon color="#2563eb" size={10} /> : <FaSun color="#f59e0b" size={10} />}
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {logoPickerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setLogoPickerOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
              />
              <motion.div
                className="logo-picker-panel"
                initial={{ opacity: 0, scale: 0.93, y: "-46%", x: "-50%" }}
                animate={{ opacity: 1, scale: 1,    y: "-50%", x: "-50%" }}
                exit={{   opacity: 0, scale: 0.93,  y: "-46%", x: "-50%" }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                style={{ position: "fixed", top: "50%", left: "50%", zIndex: 201, background: dark ? "#1e293b" : "#fff", border: `1px solid ${th.border}`, borderRadius: 24, width: 490, maxWidth: "94vw", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 64px -12px rgba(0,0,0,0.45)", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}
              >
                <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${dark ? "#2d3748" : "#f1f5f9"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: dark ? "#fff" : "#111827" }}>Choose Logo Icon</div>
                      <div style={{ fontSize: 12, color: dark ? "#64748b" : "#94a3b8", marginTop: 3 }}>Shown in the header · {ALL_ICONS.length} icons available</div>
                    </div>
                    <button onClick={() => setLogoPickerOpen(false)}
                      style={{ background: dark ? "#334155" : "#f1f5f9", border: "none", cursor: "pointer", color: dark ? "#94a3b8" : "#64748b", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaTimes size={13} />
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: dark ? "#0f172a" : "#f8fafc", borderRadius: 12, border: `1px solid ${th.border}`, padding: "9px 14px", marginBottom: 14 }}>
                    <FaSearch size={13} color={dark ? "#475569" : "#94a3b8"} />
                    <input autoFocus value={logoSearch} onChange={(e) => setLogoSearch(e.target.value)} placeholder="Search icons…"
                      style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: 14, color: dark ? "#fff" : "#111827" }} />
                    {logoSearch && (
                      <button onClick={() => setLogoSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: dark ? "#475569" : "#94a3b8", display: "flex", padding: 0 }}>
                        <FaTimes size={11} />
                      </button>
                    )}
                  </div>
                  <div className="logo-group-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
                    {ICON_GROUPS.map((g) => {
                      const count  = g === "All" ? ALL_ICONS.length : ALL_ICONS.filter((i) => i.group === g).length;
                      const active = logoGroup === g;
                      return (
                        <button key={g} onClick={() => setLogoGroup(g)}
                          style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, fontWeight: active ? 700 : 500, background: active ? "linear-gradient(135deg, #2563eb, #7c3aed)" : (dark ? "#0f172a" : "#f1f5f9"), color: active ? "#fff" : (dark ? "#94a3b8" : "#64748b"), transition: "all 0.15s", flexShrink: 0 }}>
                          {g} <span style={{ marginLeft: 5, fontSize: 10, opacity: active ? 0.8 : 0.6 }}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="logo-picker-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
                  {filteredLogoIcons.length === 0
                    ? <div style={{ textAlign: "center", padding: "48px 0", color: dark ? "#475569" : "#94a3b8", fontSize: 14 }}>No icons match "{logoSearch}"</div>
                    : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8 }}>
                        {filteredLogoIcons.map((entry) => {
                          const { Icon: EntryIcon, color: ec, key, label } = entry;
                          const isSelected = key === logoIconKey;
                          return (
                            <button key={key} className="logo-icon-btn" title={label}
                              onClick={() => { setLogoIconKey(key); setLogoPickerOpen(false); }}
                              style={{ borderRadius: 14, background: isSelected ? `${ec}20` : (dark ? "#0f172a" : "#f8fafc"), border: isSelected ? `2px solid ${ec}` : `1.5px solid ${dark ? "#1e293b" : "#e2e8f0"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 4px 10px", position: "relative" }}
                              onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = `${ec}15`; e.currentTarget.style.borderColor = ec; } }}
                              onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = dark ? "#0f172a" : "#f8fafc"; e.currentTarget.style.borderColor = dark ? "#1e293b" : "#e2e8f0"; } }}
                            >
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${ec}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <EntryIcon size={18} color={ec} />
                              </div>
                              <span style={{ fontSize: 10, lineHeight: 1.2, textAlign: "center", color: dark ? "#64748b" : "#94a3b8", fontWeight: 500, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingInline: 2 }}>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                  }
                </div>
                <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${dark ? "#2d3748" : "#f1f5f9"}`, display: "flex", gap: 10 }}>
                  <button onClick={() => { setLogoIconKey(null); setLogoPickerOpen(false); }}
                    style={{ flex: 1, padding: "11px", borderRadius: 12, background: dark ? "#334155" : "#f1f5f9", border: "none", color: dark ? "#e2e8f0" : "#334155", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <FaUndo size={11} /> Reset to default
                  </button>
                  <button onClick={() => setLogoPickerOpen(false)}
                    style={{ padding: "11px 18px", borderRadius: 12, background: dark ? "#1e293b" : "#e2e8f0", border: `1px solid ${th.border}`, color: dark ? "#94a3b8" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "#000", zIndex: 140, cursor: "pointer" }} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="tl-sidebar"
              style={{ background: th.surface, borderRight: `1px solid ${th.border}`, boxShadow: "8px 0 28px rgba(0,0,0,0.18)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700 }}>
                  <FaDatabase color="#2563eb" size={14} /> Saved Datasets
                </h3>
                <button onClick={() => setSidebarOpen(false)} style={{ background: "transparent", border: "none", color: th.text, cursor: "pointer", display: "flex", padding: 4 }}>
                  <FaTimes size={18} />
                </button>
              </div>
              <SavedDatasetsSidebar
                dark={dark} savedList={savedList} selectedTimeline={selectedTimeline}
                dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen}
                onOpen={openTimeline} onEdit={handleEditOpen} onDelete={handleDelete} th={th}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="tl-main">

          <div className="tl-card" style={{ background: th.surface, border: `1px solid ${th.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
            <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: "1.2rem", fontWeight: 700 }}>Upload &amp; Process Data</h2>
            <div className="tl-upload-row">

              <button onClick={() => fileRef.current.click()} className="tl-btn" style={{ background: "#2563eb" }}>
                <FaUpload size={13} /> Select CSV
              </button>
              <input type="file" accept=".csv" ref={fileRef} onChange={handleFile} hidden />

              {file && (
                <span className="tl-file-name" style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: dark ? "#94a3b8" : "#475569", flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <FaTable size={12} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                  {fileReady && !showMapper && (
                    <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#16a34a", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      ✓ Ready
                    </span>
                  )}
                  {needsMapping && !showMapper && !fileReady && (
                    <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fef3c7", color: "#d97706", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      ⚠ Mapping required
                    </span>
                  )}
                </span>
              )}

              {fileReady && !showMapper && needsMapping && (
                <button
                  onClick={() => { setShowMapper(true); setPreview(false); setPreviewed(false); setGenerated(false); }}
                  className="tl-btn"
                  style={{ background: "#7c3aed" }}
                >
                  <FaTable size={13} /> Re-map Columns
                </button>
              )}

             

              {fileReady && !showMapper && !generated && !previewed && (
                <button
                  onClick={() => {
                    setPreview(true);
                    setPreviewed(true);
                    setGenerated(false);
                    setSelectedTimeline(null);
                  }}
                  className="tl-btn"
                  style={{ background: "#059669" }}
                >
                  <FaTable size={13} /> Preview Table
                </button>
              )}

              {fileReady && !showMapper && !generated && previewed && (
                <button
                  onClick={() => {
                    setPreview(true);
                    setGenerated(false);
                    setSelectedTimeline(null);
                  }}
                  className="tl-btn"
                  style={{ background: dark ? "#334155" : "#e2e8f0", color: th.text }}
                >
                  <FaTable size={13} /> Preview Table
                </button>
              )}

              {fileReady && !showMapper && generated && !selectedTimeline && (
                <button
                  onClick={() => {
                    setPreview(true);
                    setGenerated(false);
                    setSelectedTimeline(null);
                  }}
                  className="tl-btn"
                  style={{ background: dark ? "#334155" : "#e2e8f0", color: th.text }}
                >
                  <FaTable size={13} /> View Table
                </button>
              )}

            </div>

            {validationErrors.length > 0 && (
              <div className="tl-errors" style={{ background: dark ? "#1e1010" : "#fff5f5", border: `1px solid #ef444444`, marginTop: 14 }}>
                {validationErrors.map((err, i) => (
                  <div key={i} className="tl-error-item" style={{ color: dark ? "#fca5a5" : "#ef4444" }}>
                    <FaExclamationTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showMapper && csvHeaders.length > 0 && (
              <ColumnMapper
                key="column-mapper"
                headers={csvHeaders}
                sampleRows={csvRawRows}
                dark={dark}
                onConfirm={handleMappingConfirm}
                onCancel={() => {
                  setShowMapper(false);
                  if (parsed.length === 0) setNeedsMapping(true);
                }}
              />
            )}
          </AnimatePresence>

          {preview && !generated && (
            <div className="tl-card" style={{ background: th.surface, border: `1px solid ${th.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: "1rem", fontWeight: 700 }}>
                  <FaTable size={14} color="#2563eb" /> Data Preview
                  <span style={{ fontSize: 12, fontWeight: 500, color: dark ? "#64748b" : "#94a3b8" }}>({parsed.length} events)</span>
                </h3>
                <button
                  onClick={() => { setGenerated(true); setPreview(false); setSelectedTimeline(null); }}
                  className="tl-btn"
                  style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
                >
                  <FaChartBar size={13} /> Generate Timeline
                </button>
              </div>

              {parsed.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: dark ? "#64748b" : "#94a3b8", fontSize: 14 }}>
                  No valid timeline events found. Please check your CSV format.
                </div>
              ) : (
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
                          <td style={{ opacity: 0.72, minWidth: 140, color: th.text, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {generated && (
            <div ref={timelineRef} className="tl-card" style={{ background: th.surface, border: `1px solid ${th.border}`, minHeight: 460 }}>

              <div className="tl-controls">
                <h2 className="tl-controls-title" style={{ color: th.text }}>
                  <FaStream size={15} color="#2563eb" />
                  <span>{selectedTimeline?.name || datasetName || "Timeline"}</span>
                </h2>

                <div className="tl-controls-right">

                  <div className="tl-seg-group" style={{ background: dark ? "#1e293b" : "#f1f5f9" }}>
                    <button
                      onClick={() => setGrouping("month")}
                      className="tl-seg-btn"
                      style={{ background: grouping !== "year" ? "#2563eb" : "transparent", color: grouping !== "year" ? "#fff" : th.text }}
                    >
                      <FaStream size={9} /> Timeline
                    </button>
                    <button
                      onClick={() => setGrouping("year")}
                      className="tl-seg-btn"
                      style={{ background: grouping === "year" ? "#2563eb" : "transparent", color: grouping === "year" ? "#fff" : th.text }}
                    >
                      <FaCalendarAlt size={9} /> Year
                    </button>
                  </div>

                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="tl-fmt-select"
                    style={{ borderColor: th.border, background: th.surface, color: th.text }}
                  >
                    {DATE_FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>

                  <div className="tl-seg-group" style={{ background: dark ? "#1e293b" : "#f1f5f9" }}>
                    <button
                      onClick={() => setView("horizontal")}
                      className="tl-seg-btn"
                      style={{ background: view === "horizontal" ? "#2563eb" : "transparent", color: view === "horizontal" ? "#fff" : th.text }}
                    >
                      <FaArrowsAltH size={9} /> Horiz
                    </button>
                    <button
                      onClick={() => setView("vertical")}
                      className="tl-seg-btn"
                      style={{ background: view === "vertical" ? "#2563eb" : "transparent", color: view === "vertical" ? "#fff" : th.text }}
                    >
                      <FaArrowsAltV size={9} /> Vert
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                    {!selectedTimeline && file && (
                      <button onClick={handleSaveToDB} className="tl-btn" style={{ background: "#7c3aed", padding: "8px 13px", borderRadius: 9, fontSize: 12 }}>
                        <FaSave size={11} /> Save
                      </button>
                    )}
                    <button
                      onClick={handleDownloadImage}
                      disabled={downloading}
                      className="tl-btn"
                      style={{ background: "#059669", padding: "8px 13px", borderRadius: 9, fontSize: 12, opacity: downloading ? 0.65 : 1, cursor: downloading ? "not-allowed" : "pointer" }}
                    >
                      {downloading
                        ? <FaSpinner size={11} style={{ animation: "spin 1s linear infinite" }} />
                        : <FaDownload size={11} />
                      } Export
                    </button>
                  </div>
                </div>
              </div>

              {grouping === "year" && events.length > 0 && (
                <div style={{ marginBottom: 14, padding: "7px 12px", borderRadius: 9, background: dark ? "#1e293b" : "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FaCalendarAlt size={10} /> Year view — events grouped by year. Click year badges to open detail modal.
                </div>
              )}

              {events.length === 0 && (
                <div style={{ textAlign: "center", padding: "64px 0", color: dark ? "#64748b" : "#94a3b8" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>No valid timeline events found</div>
                </div>
              )}

              <div
                ref={timelineBodyRef}
                style={{
                  overflowX: view === "horizontal" ? "auto" : "visible",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  width: "100%",
                  paddingLeft: view === "horizontal" ? 4 : 0,
                }}
                className="tl-noscrollbar"
              >
                <TimelineRenderer
                  events={events}
                  grouping={grouping}
                  view={view}
                  dark={dark}
                  yearGroups={yearGroups}
                  dateFormat={dateFormat}
                  onSelectEvent={setViewEvent}
                  onSelectYear={setViewYearGroup}
                />
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {viewEvent && (
            <EventDetailsModal
              event={viewEvent}
              dark={dark}
              grouping={grouping}
              dateFormat={dateFormat}
              onClose={() => setViewEvent(null)}
            />
          )}
          {viewYearGroup && (
            <YearGroupModal
              year={viewYearGroup.year}
              events={viewYearGroup.events}
              dark={dark}
              grouping={grouping}
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
    </IconProvider>
  );
}