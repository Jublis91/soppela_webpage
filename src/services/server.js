//server.js
/* eslint-env node */

// ✅ Perusmoduulit ja tarvittavat paketit
import express from "express"
import fs from "fs"
import cors from "cors"
import path from "path"
import multer from "multer"
import jwt from "jsonwebtoken"
import authRoutes from "./auth.js"
import { logEvent } from "./logger.js"
import { requireAuth, requireRole } from './middleware.js'
//import { fileURLToPath } from 'url'
import nodemailer from "nodemailer"
import process from 'node:process'

// 🗂️ Selvitetään tiedoston sijainti (ESM-tuki)
//const __filename = fileURLToPath(import.meta.url)
//const __dirname = path.dirname(__filename)
import process from 'node:process'

// 📦 Perusasetukset
const app = express()
const PORT = 3001
const IMAGES_DIR = path.join(process.cwd(), "public/images")

// 🛠️ Apufunktiot JSON-tiedostojen lukemiseen/kirjoittamiseen
const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf-8"))
const writeJSON = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")

// 💾 Multer: tiedostojen tallennus
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let targetPath = IMAGES_DIR
    if (req.params.folder) {
      targetPath = path.join(IMAGES_DIR, req.params.folder)
    }
    fs.mkdirSync(targetPath, { recursive: true })
    cb(null, targetPath)
  },
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage })

// =============================
// 🔧 Middlewaret (oikeassa järjestyksessä)
app.use(cors())
app.use(express.json())
app.use('/api', authRoutes)
app.use("/images", express.static("public/images"))

// =============================
// 🧾 Lokitus ennen yleistä middlewarea
// =============================
app.post("/api/logs", (req, res) => {
  const authHeader = req.headers.authorization
  let username = "vierailija"
  if (authHeader) {
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      username = decoded.username || 'tuntematon'
    } catch {
      // ignore invalid token
    }
  }

  const { message } = req.body
  if (!message) return res.status(400).json({ error: "Lokiviesti puuttuu" })
  logEvent(`🖥️ ${username}: ${message}`)
  res.json({ success: true })
})

// =============================
// 🔹 Kaikki pyynnöt lokitetaan konsoliin ja tiedostoon
app.use((req, res, next) => {
  logEvent(`🔹 ${req.method} ${req.originalUrl}`)
  next()
})

// =============================
// 🧑‍💻 Me-välilehti
app.get("/api/me", (req, res) => {
  try {
    const data = readJSON("./data/me_db.json")
    logEvent("📄 Me-välilehti haettu onnistuneesti")
    res.json(data)
  } catch (err) {
    logEvent(`❌ Me-välilehden haku epäonnistui: ${err.message}`)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

app.post("/api/me", requireAuth, requireRole('owner'), (req, res) => {
  const { content } = req.body
  if (!content) {
    logEvent("⚠️ Yritettiin tallentaa tyhjää sisältöä me-välilehdelle")
    return res.status(400).json({ error: "Ei sisältöä" })
  }

  try {
    writeJSON("./data/me_db.json", {
      content,
      lastModified: new Date().toISOString()
    })
    logEvent("✅ Me-välilehden sisältö tallennettu")
    res.json({ success: true })
  } catch (err) {
    logEvent(`❌ Me-välilehden tallennus epäonnistui: ${err.message}`)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

// =============================
// 📖 Kirja-välilehti
app.get("/api/book", (req, res) => {
  try {
    const data = readJSON("./data/book_db.json")
    logEvent("📖 Kirja-välilehti haettu onnistuneesti")
    res.json(data)
  } catch (err) {
    logEvent(`❌ Kirja-välilehden haku epäonnistui: ${err.message}`)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

app.post("/api/book", requireAuth, requireRole('owner'), (req, res) => {
  const { content } = req.body
  if (!content) {
    logEvent("⚠️ Yritettiin tallentaa tyhjää sisältöä kirja-välilehdelle")
    return res.status(400).json({ error: "Ei sisältöä" })
  }

  try {
    writeJSON("./data/book_db.json", {
      content,
      lastModified: new Date().toISOString()
    })
    logEvent("✅ Kirja-välilehden sisältö tallennettu")
    res.json({ success: true })
  } catch (err) {
    logEvent(`❌ Kirja-välilehden tallennus epäonnistui: ${err.message}`)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

// =============================
// 🖼️ Kuvien hallinta
app.get("/api/folders", (req, res) => {
  fs.readdir(IMAGES_DIR, { withFileTypes: true }, (err, files) => {
    if (err) {
      logEvent(`❌ Kansioiden listaus epäonnistui: ${err.message}`)
      return res.status(500).json({ error: "Kansioluettelo epäonnistui" })
    }
    const folders = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
    logEvent(`📁 Kansiot listattu: ${folders.join(", ")}`)
    res.json(folders)
  })
})

app.get("/api/images/:folder", (req, res) => {
  const folder = req.params.folder
  const folderPath = path.join(IMAGES_DIR, folder)
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      logEvent(`❌ Kuvien listaus epäonnistui (${folder}): ${err.message}`)
      return res.status(500).json({ error: "Kuvien haku epäonnistui" })
    }
    const imagePaths = files.map(file => `/images/${folder}/${file}`)
    logEvent(`🖼️ Kuvat listattu kansiosta '${folder}': ${files.length} kpl`)
    res.json(imagePaths)
  })
})

app.post("/api/images/:folder", upload.single("image"), requireAuth, requireRole('owner'), (req, res) => {
  if (!req.file) {
    logEvent("⚠️ Kuvaa ei toimitettu ladattaessa")
    return res.status(400).json({ error: "Ei kuvaa ladattavaksi" })
  }
  logEvent(`✅ Kuva ladattu: ${req.file.filename} → /${req.params.folder}`)
  res.json({ success: true, filename: req.file.filename })
})

app.delete("/api/images/:folder/:filename", requireAuth, requireRole('owner'), (req, res) => {
  const { folder, filename } = req.params
  const filePath = path.join(IMAGES_DIR, folder, filename)
  fs.unlink(filePath, (err) => {
    if (err) {
      logEvent(`❌ Kuvaa '${filename}' ei voitu poistaa: ${err.message}`)
      return res.status(500).json({ error: "Kuvan poisto epäonnistui" })
    }
    logEvent(`🗑️ Kuva poistettu: ${filename} kansiosta ${folder}`)
    res.json({ success: true })
  })
})

// =============================
// 📧 Yhteydenottolomake
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    logEvent("⚠️ Yhteydenottolomakkeen kentät puuttuvat")
    return res.status(400).json({ success: false, error: "Kaikki kentät vaaditaan" })
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Yhteydenotto: ${name}`,
    text: `Nimi: ${name}\nSähköposti: ${email}\n\nViesti:\n${message}`
  }

  try {
    await transporter.sendMail(mailOptions)
    logEvent(`📧 Yhteydenottolomake lähetetty: ${name} <${email}>`)
    res.status(200).json({ success: true, message: "Viesti lähetetty onnistuneesti" })
  } catch (error) {
    logEvent(`❌ Yhteydenottolomakkeen lähetys epäonnistui: ${error.message}`)
    res.status(500).json({ success: false, error: "Viestin lähetys epäonnistui" })
  }
})

// =============================
// 🚀 Käynnistetään palvelin
app.listen(PORT, () => {
  logEvent(`🚀 Palvelin käynnistyi porttiin ${PORT}`)
  console.log(`✅ Palvelin käynnissä http://localhost:${PORT}`)
})
