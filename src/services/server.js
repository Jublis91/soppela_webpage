//server.js
/* eslint-env node */

// ✅ Perusmoduulit ja tarvittavat paketit
import express from "express"
import * as fs from "fs"
import cors from "cors"
import path from "path"
import multer from "multer"
import authRoutes from "./auth.js"
import { logEvent } from "./logger.js"
import { requireAuth, requireRole } from './middleware.js'
//import { fileURLToPath } from 'url'
import nodemailer from "nodemailer"
import process from 'node:process'

// 🗂️ Selvitetään tiedoston sijainti (ESM-tuki)
//const __filename = fileURLToPath(import.meta.url)
//const __dirname = path.dirname(__filename)
//import process from 'node:process'

// 📦 Perusasetukset
const app = express()
const PORT = 3001
const IMAGES_DIR = path.join(process.cwd(), "public/images")
const IMAGES_BASE_PATH = path.resolve(IMAGES_DIR)

fs.mkdirSync(IMAGES_DIR, { recursive: true })

const SAFE_FOLDER_REGEX = /^[A-Za-z0-9_-]+$/
const SAFE_FILENAME_REGEX = /^[A-Za-z0-9_.-]+$/

function sanitizeSegment(segment, regex, type) {
  if (typeof segment !== 'string' || !regex.test(segment) || segment.includes('..') || path.isAbsolute(segment)) {
    throw new Error(`Virheellinen ${type}`)
  }
  return segment
}

function resolveImagePath(...segments) {
  const resolvedPath = path.resolve(IMAGES_BASE_PATH, ...segments)
  if (resolvedPath !== IMAGES_BASE_PATH && !resolvedPath.startsWith(`${IMAGES_BASE_PATH}${path.sep}`)) {
    throw new Error('Polku ei ole sallittu')
  }
  return resolvedPath
}

function validateFolderParam(req, res, next) {
  try {
    const safeFolder = sanitizeSegment(req.params.folder, SAFE_FOLDER_REGEX, 'kansion nimi')
    req.safeFolder = safeFolder
    req.folderPath = resolveImagePath(safeFolder)
    next()
  } catch (error) {
    logEvent(`⛔ Virheellinen kansion nimi '${req.params.folder}': ${error.message}`)
    res.status(400).json({ error: 'Virheellinen kansion nimi' })
  }
}

function validateFilenameParam(req, res, next) {
  try {
    const safeFilename = sanitizeSegment(req.params.filename, SAFE_FILENAME_REGEX, 'tiedoston nimi')
    req.safeFilename = safeFilename
    req.filePath = resolveImagePath(req.safeFolder ?? sanitizeSegment(req.params.folder, SAFE_FOLDER_REGEX, 'kansion nimi'), safeFilename)
    next()
  } catch (error) {
    logEvent(`⛔ Virheellinen tiedoston nimi '${req.params.filename}': ${error.message}`)
    res.status(400).json({ error: 'Virheellinen tiedoston nimi' })
  }
}

// 🛠️ Apufunktiot JSON-tiedostojen lukemiseen/kirjoittamiseen
const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf-8"))
const writeJSON = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")

// 💾 Multer: tiedostojen tallennus
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folderPath = req.folderPath ?? resolveImagePath(sanitizeSegment(req.params.folder, SAFE_FOLDER_REGEX, 'kansion nimi'))
      fs.mkdirSync(folderPath, { recursive: true })
      cb(null, folderPath)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    try {
      const safeName = sanitizeSegment(file.originalname, SAFE_FILENAME_REGEX, 'tiedoston nimi')
      cb(null, safeName)
    } catch (error) {
      cb(error)
    }
  }
})
const upload = multer({ storage })

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      logEvent(`❌ Kuvan lataus epäonnistui: ${err.message}`)
      return res.status(400).json({ error: "Virheellinen kuvatiedosto" })
    }
    next()
  })
}

// =============================
// 🔧 Middlewaret (oikeassa järjestyksessä)
app.use(cors())
app.use(express.json())
app.use('/api', authRoutes)
app.use("/images", express.static("public/images"))

// =============================
// 🧾 Lokitus ennen yleistä middlewarea
// =============================
app.post("/api/logs", requireAuth, (req, res) => {
  const username = req.user?.username ?? 'tuntematon'

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
    const folders = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => SAFE_FOLDER_REGEX.test(name))

    logEvent(`📁 Kansiot listattu: ${folders.join(", ")}`)
    res.json(folders)
  })
})

app.get("/api/images/:folder", validateFolderParam, (req, res) => {
  fs.readdir(req.folderPath, (err, files) => {
    if (err) {
      logEvent(`❌ Kuvien listaus epäonnistui (${req.safeFolder}): ${err.message}`)
      return res.status(500).json({ error: "Kuvien haku epäonnistui" })
    }
    const safeFiles = files.filter(file => SAFE_FILENAME_REGEX.test(file))
    const imagePaths = safeFiles.map(file => `/images/${req.safeFolder}/${file}`)
    logEvent(`🖼️ Kuvat listattu kansiosta '${req.safeFolder}': ${imagePaths.length} kpl`)
    res.json(imagePaths)
  })
})

app.post("/api/images/:folder", requireAuth, requireRole('owner'), validateFolderParam, uploadImage, (req, res) => {
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
      if (err.code === 'ENOENT') {
        logEvent(`⚠️ Kuvaa '${req.safeFilename}' ei löytynyt kansiosta ${req.safeFolder}`)
        return res.status(404).json({ error: "Kuvaa ei löydy" })
      }
      logEvent(`❌ Kuvaa '${req.safeFilename}' ei voitu poistaa: ${err.message}`)
      return res.status(500).json({ error: "Kuvan poisto epäonnistui" })
    }
    logEvent(`🗑️ Kuva poistettu: ${req.safeFilename} kansiosta ${req.safeFolder}`)
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
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logEvent(`🚀 Palvelin käynnistyi porttiin ${PORT}`)
    console.log(`✅ Palvelin käynnissä http://localhost:${PORT}`)
  })
}

export default app