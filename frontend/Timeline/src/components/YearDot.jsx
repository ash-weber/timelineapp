import { motion } from "framer-motion";

export default function YearDot({ year, count, dark, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        gap: 0,
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          display: "flex",
          flexDirection: "column",   // moved here — where it actually affects layout
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 5px #2563eb22",
          color: "#fff",
          gap: 1,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1 }}>{year}</span>
        <span style={{ fontSize: 10, opacity: 0.75, fontWeight: 500, lineHeight: 1 }}>
          {count} ev.
        </span>
      </div>
    </motion.div>
  );
}