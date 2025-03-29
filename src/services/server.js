// server.js

import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/content", (req, res) => {
  try {
    const data = fs.readFileSync("./data/me_db.json", "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("❌ Virhe luettaessa tiedostoa:", err.message);
    res.status(500).json({ error: "Tiedoston lukeminen epäonnistui" });
  }
});

app.post("/api/content", (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content missing" });
  }

  try {
    fs.writeFileSync("./data/me_db.json", JSON.stringify({ content }, null, 2), "utf8");
    console.log("✅ Sisältö tallennettu tiedostoon");
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Kirjoitusvirhe:", err.message);
    res.status(500).json({ error: "Tiedoston tallennus epäonnistui" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Palvelin käynnissä osoitteessa http://localhost:${PORT}`);
});
