require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json({ limit: "10mb" }));

const aiRoutes = require("./ai/routes/ai");
app.use("/api/ai", aiRoutes);

const matchRoutes = require("./ai/routes/match");
app.use("/api/ai", matchRoutes);

const assessmentRoutes = require("./ai/routes/assessment");
app.use("/api/ai", assessmentRoutes);

const interviewRoutes = require("./ai/routes/interview");
app.use("/api/ai", interviewRoutes);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "HireLoop AI",
    status: "running",
  });
});

const PORT = process.env.AI_PORT || 6000;

app.listen(PORT, () => {
  console.log(`AI service running on http://localhost:${PORT}`);
});
