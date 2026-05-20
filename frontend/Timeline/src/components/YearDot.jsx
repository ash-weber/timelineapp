import { motion } from "framer-motion";

export default function YearDot({ year, count, dark, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.12 }}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 6px #2563eb22",
          color: "#fff",
          fontWeight: 800,
          fontSize: 13,
          flexDirection: "column",
        }}
      >
        <span style={{ fontSize: 11, opacity: 0.8 }}>{count} ev.</span>
      </div>
      <div
        style={{
          color: dark ? "#fff" : "#111827",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        {year}
      </div>
    </motion.div>
  );
}