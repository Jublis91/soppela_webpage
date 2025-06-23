import express from "express"
import fs from "fs"
import cors from "cors"
import path from "path"
import multer from "multer"
import jwt from "jsonwebtoken"
import authRoutes from "./auth.js"
import { logEvent } from "./logger.js"
import { requireAuth, requireRole } from './middleware.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const nodemailer = require("nodemailer")

const app = express()
const PORT = 3001
const IMAGES_DIR = path.join(process.cwd(), "public/images")

app.use(cors())
app.use(express.json())
app.use('/api', authRoutes)
app.use("/images", express.static("public/images"))

// 📦 Määrittele tiedostojen tallennus
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let targetPath = IMAGES_DIR

    // Jos kyseessä asetusten taustakuva/profiilikuva
    if (req.originalUrl.includes("/upload/settings-image")) {
      targetPath = path.join(IMAGES_DIR, "settings")
    }
    // Jos reitti sisältää kansion parametrin
    else if (req.params.folder) {
      targetPath = path.join(IMAGES_DIR, req.params.folder)
    }

    fs.mkdirSync(targetPath, { recursive: true })
    cb(null, targetPath)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

// Aputoiminnot
const readJSON = (path) => {
  return JSON.parse(fs.readFileSync(path, "utf-8"))
}
const writeJSON = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8")
}

// Asetusten lukeminen
app.get("/api/settings", (req, res) => {
  try {
    const data = readJSON("./data/settings.json")
    logEvent("📄 Asetukset haettu onnistuneesti")
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: "Virhe asetustiedoston käsittelyssä" })
    logEvent(`❌ Asetustiedoston haku epäonnistui: ${err.message}`)
  }
})

// Asetusten päivittäminen
app.post("/api/settings", requireAuth, requireRole('owner'), (req, res) => {
  const { backroundImage, ProfileImage } = req.body
  if (!backroundImage || !ProfileImage) {
    logEvent("⚠️ Yritettiin tallentaa puutteellisia asetuksia")
    return res.status(400).json({ error: "Puuttuvat asetukset" })
  }

  try {
    writeJSON("./data/settings.json", { backroundImage, ProfileImage })
    logEvent("✅ Asetukset tallennettu onnistuneesti")
    res.json({ success: true })
  } catch (err) {
    logEvent(`❌ Asetusten tallennus epäonnistui: ${err.message}`)
    res.status(500).json({ error: "Virhe asetustiedoston käsittelyssä" })
  }
})

// Profiili- ja taustakuvan lataus
app.post("/api/upload/settings-image", requireAuth, requireRole('owner'), upload.single("image"), (req, res) => {
  const { type } = req.body
  if (!req.file || (type !== "profile" && type !== "background")) {
    logEvent("⚠️ Väärä kuvatyyppi tai puuttuva tiedosto")
    return res.status(400).json({ error: "Virheellinen pyyntö" })
  }

  try {
    const settings = readJSON("./data/settings.json")
    if (type === "profile") settings.ProfileImage = `settings/${req.file.filename}`
    if (type === "background") settings.backroundImage = `settings/${req.file.filename}`
    writeJSON("./data/settings.json", settings)

    logEvent(`🖼️ ${type}-kuva päivitetty: ${req.file.filename}`)
    res.json({ success: true, filename: req.file.filename })
  } catch (err) {
    logEvent(`❌ Kuvan tallennus epäonnistui: ${err.message}`)
    res.status(500).json({ error: "Tallennusvirhe" })
  }
})

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

// Listaa kansiot ja kuvat
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

// Yleinen logitusmiddleware
app.use((req, res, next) => {
  logEvent(`🔹 ${req.method} ${req.originalUrl}`)
  next()
})

// Lokiviestit frontendiltä
app.post("/api/logs", (req, res) => {
  const authHeader = req.headers.authorization
  let username = "vierailija"

  if (authHeader) {
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, 'SECRET') // käytä oikeaa salaisuutta
      username = decoded.username || 'tuntematon'
    } catch (err) {}
  }

  const { message } = req.body
  if (!message) return res.status(400).json({ error: "Lokiviesti puuttuu" })

  logEvent(`🖥️ ${username}: ${message}`)
  res.json({ success: true })
})

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    logEvent("⚠️ Yhteydenottolomakkeen kentät puuttuvat")
    return res.status(400).json({ success: false, error: "Kaikki kentät vaaditaan" })
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "juuso.nikander91@gmail.com", // käytä .env tiedostoa
      pass: process.env.EMAIL_PASS || "your-app-password"           // käytä sovellussalasanaa
    }
  })

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER || "juuso.nikander91@gmail.com",
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

// Käynnistä palvelin
app.listen(PORT, () => {
  logEvent(`🚀 Palvelin käynnistyi porttiin ${PORT}`)
  console.log(`✅ Palvelin käynnissä http://localhost:${PORT}`)
})
