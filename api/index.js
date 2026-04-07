import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

app.get("/api", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

// Vercel needs this exact signature
export default function handler(req, res) {
  return app(req, res);
}