require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

const aiRoutes = require("./ai/routes/ai");
app.use("/api/ai", aiRoutes);

const matchRoutes = require("./ai/routes/match");
app.use("/api/ai", matchRoutes);

const assessmentRoutes = require("./ai/routes/assessment");
app.use("/api/ai", assessmentRoutes);

const interviewRoutes = require("./ai/routes/interview");
app.use("/api/ai", interviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AI test server running on http://localhost:${PORT}`);
});
