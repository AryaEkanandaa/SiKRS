require("dotenv").config();
const express = require("express");
const cors = require("cors");

const auth = require("./middleware/auth");
const roleGuard = require("./middleware/roleGuard");
const { clearAllCache } = require("./utils/redis");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dosenRoutes = require("./routes/dosenRoutes");
const mahasiswaRoutes = require("./routes/mahasiswaRoutes");
const programStudiRoutes = require("./routes/programStudiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dosen", dosenRoutes);
app.use("/api/mahasiswa", mahasiswaRoutes);
app.use("/api/program-studi", programStudiRoutes);

app.post("/api/cache/clear", auth, roleGuard("ADMIN"), async (req, res) => {
  await clearAllCache();
  res.json({ message: "Cache cleared" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.code === "P2002") {
    return res.status(409).json({ message: "Data already exists (unique constraint)" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
