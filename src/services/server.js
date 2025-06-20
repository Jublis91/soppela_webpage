// server.js

import express from "express"
import fs from "fs"
import cors from "cors"
import path from "path"
import multer from "multer"
import authRoutes from "./auth.js"
import { logEvent } from "./logger.js"
import { requireAuth, requireRole } from './middleware.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001
const IMAGES_DIR = path.join(process.cwd(), "public/images")

app.use(cors())
app.use(express.json())
app.use('/api', authRoutes)
app.use("/images", express.static("public/images"))

// Middleware joka logittaa kaikki pyynnöt
app.use((req, res, next) => {
  logEvent(`🔹 ${req.method} ${req.originalUrl}`)
  next()
})

// Aputoiminnot
const readJSON = (path) => {
  return JSON.parse(fs.readFileSync(path, "utf-8"))
}

const writeJSON = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8")
}

// Me-välilehti
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
    writeJSON("./data/me_db.json", { content })
    logEvent("✅ Me-välilehden sisältö tallennettu")
    res.json({ success: true })
  } catch (err) {
    logEvent(`❌ Me-välilehden tallennus epäonnistui: ${err.message}`)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

// Kirja-välilehti
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
    writeJSON("./data/book_db.json", { content })
    logEvent("✅ Kirja-välilehden sisältö tallennettu")
    res.json({ success: true })
  } catch (err) {
    logEvent(`❌ Kirja-välilehden tallennus epäonnistui: ${err.message}`)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

// Listaa kaikki kansiot
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

// Listaa kuvat kansiosta
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

// Kuva lataus
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder
    const targetPath = path.join(IMAGES_DIR, folder)
    fs.mkdirSync(targetPath, { recursive: true })
    cb(null, targetPath)
  }
})

const upload = multer({ storage })

app.post("/api/images/:folder", upload.single("image"), requireAuth, requireRole('owner'), (req, res) => {
  if (!req.file) {
    logEvent("⚠️ Kuvaa ei toimitettu ladattaessa")
    return res.status(400).json({ error: "Ei kuvaa ladattavaksi" })
  }

  logEvent(`✅ Kuva ladattu: ${req.file.filename} → /${req.params.folder}`)
  res.json({ success: true, filename: req.file.filename })
})

// Poista kuva
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

// palvelimen käynnistys
app.listen(PORT, () => {
  logEvent(`🚀 Palvelin käynnistyi porttiin ${PORT}`)
  console.log(`✅ Palvelin käynnissä http://localhost:${PORT}`)
})

// Vastaanottaa frontendin logiviestejä – vain kirjautuneilta käyttäjiltä
app.post("/api/logs", (req, res) => {
  const authHeader = req.headers.authorization
  let username = "vierailija"

  // Jos mukana on token → yritetään purkaa se
  if (authHeader) {
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, 'SECRET') // varmista sama SECRET
      username = decoded.username || 'tuntematon'
    } catch (err) {
      // Ei tehdä mitään, jatketaan anonyymina
    }
  }

  const { message } = req.body
  if (!message) return res.status(400).json({ error: "Lokiviesti puuttuu" })

  logEvent(`🖥️ ${username}: ${message}`)
  res.json({ success: true })
})