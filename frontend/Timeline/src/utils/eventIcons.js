import {
  FaRocket, FaGraduationCap, FaBriefcase, FaHeartbeat,
  FaTrophy, FaMoneyBillWave, FaMapMarkerAlt, FaUsers,
  FaMicrochip, FaFlask, FaBullhorn, FaHandshake,
  FaPlane, FaMusic, FaBook, FaBaby, FaHome,
  FaCar, FaFootballBall, FaGlobe, FaRegCalendarCheck,
} from "react-icons/fa";

const RULES = [
  { keys: ["launch", "release", "ship", "deploy", "publish"],  Icon: FaRocket,           color: "#f97316" },
  { keys: ["graduate", "graduation", "degree", "university", "school", "education", "study"], Icon: FaGraduationCap, color: "#8b5cf6" },
  { keys: ["job", "hire", "hired", "employ", "career", "work", "office", "promotion", "resign"], Icon: FaBriefcase, color: "#0ea5e9" },
  { keys: ["health", "hospital", "surgery", "medical", "doctor", "sick", "recover", "birth", "born"], Icon: FaHeartbeat, color: "#ef4444" },
  { keys: ["award", "win", "won", "trophy", "prize", "champion", "victory"], Icon: FaTrophy, color: "#eab308" },
  { keys: ["fund", "invest", "revenue", "profit", "money", "ipo", "acquisition", "raised"], Icon: FaMoneyBillWave, color: "#22c55e" },
  { keys: ["move", "reloc", "city", "country", "travel", "visit", "trip"], Icon: FaMapMarkerAlt, color: "#ec4899" },
  { keys: ["team", "partner", "meet", "conference", "summit", "group", "community"], Icon: FaUsers, color: "#6366f1" },
  { keys: ["tech", "software", "hardware", "code", "develop", "engineer", "ai", "robot", "chip"], Icon: FaMicrochip, color: "#14b8a6" },
  { keys: ["research", "experiment", "lab", "discover", "science", "study"], Icon: FaFlask, color: "#a855f7" },
  { keys: ["announce", "announ", "press", "news", "campaign", "market"], Icon: FaBullhorn, color: "#f59e0b" },
  { keys: ["deal", "sign", "agreement", "merger", "partner", "contract"], Icon: FaHandshake, color: "#10b981" },
  { keys: ["flight", "fly", "airline", "airport", "travel"], Icon: FaPlane, color: "#38bdf8" },
  { keys: ["music", "concert", "album", "song", "band", "festival"], Icon: FaMusic, color: "#e879f9" },
  { keys: ["book", "publish", "novel", "write", "author", "paper"], Icon: FaBook, color: "#6d28d9" },
  { keys: ["baby", "born", "birth", "pregnan", "child"], Icon: FaBaby, color: "#fb7185" },
  { keys: ["home", "house", "buy", "rent", "property", "apartment"], Icon: FaHome, color: "#84cc16" },
  { keys: ["car", "vehicle", "drive", "auto", "motor"], Icon: FaCar, color: "#f97316" },
  { keys: ["sport", "game", "match", "football", "soccer", "basket", "tennis", "race"], Icon: FaFootballBall, color: "#22d3ee" },
  { keys: ["global", "world", "international", "expan"], Icon: FaGlobe, color: "#2563eb" },
];

const DEFAULT = { Icon: FaRegCalendarCheck, color: "#2563eb" };


export function getEventIcon(event) {
  const hay = `${event.title || ""} ${event.description || ""}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.keys.some((k) => hay.includes(k))) {
      return { Icon: rule.Icon, color: rule.color };
    }
  }
  return DEFAULT;
}