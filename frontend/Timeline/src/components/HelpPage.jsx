import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowLeft, HiPlus, HiMinus, HiQuestionMarkCircle } from "react-icons/hi";
import {
  FaCheckCircle,
  FaDatabase,
  FaLaptop,
} from "react-icons/fa";
import IBACUS_LOGO from "../assets/ibacus.png";
import TECH_COACH_LOGO from "../assets/tech_coach.png";

const TEMPLATE_CSV = [
  "name,date,description",
  "Product Launch,2024-01-15,Launched version 1.0 of the product to the market",
  "Team Expansion,2024-03-10,Hired 5 new engineers to grow the development team",
  "Funding Round,2024-06-01,Closed Series A funding of $5M to accelerate growth",
  "New Office,2024-08-20,Moved to a larger office to accommodate the growing team",
  "Annual Conference,2024-11-05,Hosted our first annual customer conference with 200 attendees",
].join("\n");

const TEMPLATE_URL = `data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE_CSV)}`;

const faqs = [
  {
    Icon: FaCheckCircle,
    color: "#10b981",
    q: "Is this free to use?",
    a: "Yes. Currently this is completely free to use for business leaders and developers alike.",
  },
  {
    Icon: FaDatabase,
    color: "#3b82f6",
    q: "Is the data and timeline saved so that I can reuse this?",
    a: "Yes. Your timeline records are automatically captured and linked to your session history, enabling seamless access whenever you return.",
  },
  {
    Icon: FaLaptop,
    color: "#8b5cf6",
    q: "How do I login to the application?",
    a: "No complex passwords or credentials required. The system recognizes your unique workspace parameters directly from your local hardware security configuration.",
  },
];

export default function HelpPage({ dark, onBack }) {
  const [openIndex, setOpenIndex] = useState(null);

  const th = dark
    ? {
        bg: "#030712",
        card: "#111827",
        text: "#f9fafb",
        sub: "#9ca3af",
        muted: "#6b7280",
        border: "rgba(255,255,255,0.06)",
        accent: "#3b82f6",
        faqActBg: "rgba(59,130,246,0.04)",
      }
    : {
        bg: "#f8fafc",
        card: "#ffffff",
        text: "#0f172a",
        sub: "#475569",
        muted: "#94a3b8",
        border: "#e2e8f0",
        accent: "#2563eb",
        faqActBg: "#f0fdf4",
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        minHeight: "100vh",
        background: th.bg,
        fontFamily: "'Inter', sans-serif",
        color: th.text,
        overflowX: "hidden",
      }}
    >

      
      <header style={{ position: "sticky", top: 0, zIndex: 50 }}>

        <div
          style={{
            background: "#0b0f1e",
            position: "relative",
            overflow: "hidden",
            height: 68,
          }}
        >
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(105deg, rgba(37,99,235,0.18) 0%, transparent 55%)",
          }} />
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(255deg, rgba(124,58,237,0.18) 0%, transparent 55%)",
          }} />
          <div style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: 1,
            background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent)",
            transform: "skewX(-8deg)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, rgba(37,99,235,0.6), rgba(124,58,237,0.6))",
          }} />

          <div style={{
            position: "relative", zIndex: 1,
            height: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
          }}>

            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "0 2rem",
              borderRight: "none",
            }}>
              <div style={{
                width: 46, height: 46,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}>
                <img
                  src={TECH_COACH_LOGO}
                  alt="TechCoach For You"
                  style={{ width: 38, height: 38, objectFit: "contain" }}
                />
              </div>
              <div>
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)", marginBottom: 2,
                }}>
                  Powered by
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.1px" }}>
                  TechCoach For You
                </div>
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "0 2rem",
              justifyContent: "flex-end",
            }}>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)", marginBottom: 2,
                }}>
                  Built by
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.1px" }}>
                  iBacus Tech Solutions
                </div>
              </div>
              <div style={{
                width: 46, height: 46,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}>
                <img
                  src={IBACUS_LOGO}
                  alt="iBacus Tech Solutions"
                  style={{ width: 38, height: 38, objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: dark ? "rgba(6,13,31,0.98)" : "#ffffff",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "#e9ecef"}`,
            padding: "0 2rem",
            height: 46,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: dark ? "0 2px 16px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 13px",
              background: dark ? "rgba(99,102,241,0.1)" : "rgba(37,99,235,0.06)",
              border: `1px solid ${dark ? "rgba(99,102,241,0.22)" : "rgba(37,99,235,0.15)"}`,
              borderRadius: 8,
              color: dark ? "#818cf8" : "#2563eb",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            <HiArrowLeft size={13} />
            Back
          </motion.button>

          <div style={{ width: 1, height: 16, background: dark ? "rgba(255,255,255,0.07)" : "#e2e8f0" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
            <span style={{ color: dark ? "#475569" : "#94a3b8" }}>Timeline View</span>
            <span style={{ color: dark ? "#334155" : "#d1d5db", margin: "0 2px" }}>›</span>
            <div style={{
              padding: "6px 12px", borderRadius: 20,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#fff", fontSize: 11, fontWeight: 700,
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              display: "flex", alignItems: "center", gap: 6,
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <HiQuestionMarkCircle size={14} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))" }} />
              </motion.div>
              Help Center
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3.5rem 1.5rem 6rem" }}>

        <div style={{ marginBottom: "4rem" }}>
          <h1 style={{
            fontSize: "2.25rem", fontWeight: 600, color: th.text,
            margin: "0 0 8px 0", letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>
            Storytelling with Timelines
          </h1>
          <p style={{ color: th.muted, fontSize: "14px", margin: "0 0 28px 0", fontWeight: 400 }}>
            Last Updated: May 2026
          </p>
          <p style={{ color: th.sub, fontSize: "15px", lineHeight: "1.75", margin: "0 0 20px 0", fontWeight: 400 }}>
            This app is designed to help business leaders convert any dataset to a visual timeline. Whether you are talking to employees or prospects/customers a timeline is a powerful way to get your idea across when the data is presented visually.
          </p>
          <p style={{ color: th.sub, fontSize: "15px", fontWeight: 400, margin: 0, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
            <span>Use this</span>
            <motion.a
              href={TEMPLATE_URL}
              download="timeline_template.csv"
              style={{ color: th.accent, fontWeight: 600, textDecoration: "none", position: "relative", padding: "0 2px", display: "inline-block" }}
              whileHover={{ scale: 1.02 }}
            >
              template
              <motion.span style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: "2px", background: th.accent, borderRadius: "1px" }} />
            </motion.a>
            <span>to create data and upload.</span>
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1.5rem", color: th.text, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 4, height: 16, background: th.accent, borderRadius: 2 }} />
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map(({ Icon, color, q, a }, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: isOpen ? th.faqActBg : th.card,
                    border: `1px solid ${isOpen ? th.accent : th.border}`,
                    borderRadius: 14, overflow: "hidden", transition: "all 0.2s ease-out",
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "1rem", padding: "1.15rem 1.5rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} color={color} />
                    </div>
                    <span style={{ flex: 1, color: th.text, fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4 }}>{q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ color: isOpen ? th.accent : th.muted, flexShrink: 0 }}
                    >
                      {isOpen ? <HiMinus size={16} /> : <HiPlus size={16} />}
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                      >
                        <div style={{ padding: "0 1.5rem 1.4rem 4.65rem", color: th.sub, fontSize: "0.925rem", lineHeight: 1.7 }}>
                          {a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}