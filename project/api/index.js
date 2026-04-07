import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

// IMPORTANT for Vercel
export default app;