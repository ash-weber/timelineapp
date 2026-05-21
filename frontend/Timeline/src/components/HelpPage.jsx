import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowLeft, HiPlus, HiMinus } from "react-icons/hi";
import {
  FaCheckCircle,
  FaDatabase,
  FaLaptop,
  FaStream,
} from "react-icons/fa";

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
        surface: "rgba(17, 24, 39, 0.7)", 
        card: "#111827",
        text: "#f9fafb",
        sub: "#9ca3af",
        muted: "#6b7280",
        border: "rgba(255, 255, 255, 0.06)",
        accent: "#3b82f6", 
        faqActBg: "rgba(59, 130, 246, 0.04)",
      }
    : {
        bg: "#f8fafc",
        surface: "rgba(255, 255, 255, 0.8)",
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
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: th.surface,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${th.border}`,
          padding: "0 2rem",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: dark ? "rgba(255,255,255,0.03)" : "#fff",
              border: `1px solid ${th.border}`,
              borderRadius: "10px",
              color: th.sub,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <HiArrowLeft size={14} />
            Back
          </motion.button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: th.muted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FaStream size={12} color={th.accent} />
              <span style={{ color: th.muted, fontWeight: 400 }}>Timeline Engine</span>
            </span>
            <span>/</span>
            <span style={{ color: th.text, fontWeight: 500 }}>Help</span>
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3.5rem 1.5rem 6rem" }}>
        
        {/* ── Content Section ── */}
        <div style={{ marginBottom: "4rem" }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 600,
              color: th.text,
              margin: "0 0 8px 0",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Storytelling with Timelines
          </h1>
          
          <p style={{ color: th.muted, fontSize: "14px", margin: "0 0 28px 0", fontWeight: 400 }}>
            Last Updated: May 2026
          </p>
          
          <p
            style={{
              color: th.sub,
              fontSize: "15px",
              lineHeight: "1.75",
              margin: "0 0 20px 0",
              fontWeight: 400,
            }}
          >
           This app is designed to help business leaders convert any dataset to a visual timeline. Whether you are talking to employees or prospects/customers a timeline is a powerful way to get your idea across when the data is presented visually
          </p>
          
          <p style={{ color: th.sub, fontSize: "15px", fontWeight: 400, margin: 0, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
            <span>Use this</span>
            <motion.a
              href={TEMPLATE_URL}
              download="timeline_template.csv"
              style={{
                color: th.accent,
                fontWeight: 600,
                textDecoration: "none",
                position: "relative",
                padding: "0 2px",
                display: "inline-block",
              }}
              whileHover={{ scale: 1.02 }}
            >
              template
              <motion.span 
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: th.accent,
                  borderRadius: "1px"
                }}
              />
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
                <div
                  key={i}
                  style={{
                    background: isOpen ? th.faqActBg : th.card,
                    border: `1px solid ${isOpen ? th.accent : th.border}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    transition: "all 0.2s ease-out",
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1.15rem 1.5rem",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: `${color}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={13} color={color} />
                    </div>

                    <span style={{ flex: 1, color: th.text, fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4 }}>
                      {q}
                    </span>

                    <div style={{ color: isOpen ? th.accent : th.muted, flexShrink: 0 }}>
                      {isOpen ? <HiMinus size={16} /> : <HiPlus size={16} />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                      >
                        <div
                          style={{
                            padding: "0 1.5rem 1.4rem 4.65rem",
                            color: th.sub,
                            fontSize: "0.925rem",
                            lineHeight: 1.7,
                          }}
                        >
                          {a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
}