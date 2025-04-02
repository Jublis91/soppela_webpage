// server.js

import express from "express"
import fs from "fs"
import cors from "cors"
import path from "path"
import multer from "multer"

const app = express()
const PORT = 3001
const IMAGES_DIR = path.join(process.cwd(), "public/images")

app.use(cors())
app.use(express.json())
app.use("/images", express.static("public/images"))

// aputoiminnot tiedostojen lukuun ja kirjoittamiseen
const readJSON = (path) => {
  return JSON.parse(fs.readFileSync(path, "utf-8"))
}

const writeJSON = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8")
}

// API reitit
// Me välilehti
app.get("/api/me", (req, res) => {
  try {
    const data = readJSON("./data/me_db.json")
    res.json(data)
  }
  catch (err) {
    console.error("❌ Virhe luettaessa tiedostoa:", err.message)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

app.post("/api/me", (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ error: "Ei sisältöä" })

  try {
    writeJSON("./data/me_db.json", { content })
    console.log("✅ Tallennettu palvelimelle")
    res.json({ success: true })
  }
  catch (err) {
    console.error("❌ Virhe tallennuksessa:", err.message)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

// Kirja välilehti
app.get("/api/book", (req, res) => {
  try {
    const data = readJSON("./data/book_db.json")
    res.json(data)
  }
  catch (err) {
    console.error("❌ Virhe luettaessa tiedostoa:", err.message)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

app.post("/api/book", (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ error: "Ei sisältöä" })

  try {
    writeJSON("./data/book_db.json", { content })
    console.log("✅ Tallennettu palvelimelle")
    res.json({ success: true })
  }
  catch (err) {
    console.error("❌ Virhe tallennuksessa:", err.message)
    res.status(500).json({ error: "Virhe tiedoston käsittelyssä" })
  }
})

// kuvat
// Listaa kaikki alikansiot /public/images-kansiosta
app.get("/api/folders", (req, res) => {
  fs.readdir(IMAGES_DIR, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error("❌ Virhe haettaessa kansioita:", err.message)
      return res.status(500).json({ error: "Kansioluettelo epäonnistui" })
    }

    const folders = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    res.json(folders)
  })
})

// Listaa tietyn alikansion kuvat
app.get("/api/images/:folder", (req, res) => {
  const folder = req.params.folder
  const folderPath = path.join(IMAGES_DIR, folder)

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("❌ Virhe haettaessa kuvia:", err.message)
      return res.status(500).json({ error: "Kuvien haku epäonnistui" })
    }

    const imagePaths = files.map(file => `/images/${folder}/${file}`)
    res.json(imagePaths)
  })
})

// Lataa kuva palvelimelle
const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    const folder = req.params.folder
    const targetPath = path.join(IMAGES_DIR, folder)

    // tarkista, onko kansio olemassa
    fs.mkdirSync(targetPath, { recursice: true })
    cb(null, targetPath)
  }
})

const upload = multer({ storage })

app.post("/api/images/:folder", upload.single("image"), (req,res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Ei kuvaa ladattavaksi" })
  }

  console.log("✅ Kuva ladattu:", req.file.path)
  res.json({ success: true, filename: req.file.filename })
})

// Poistaa kuvan
app.delete("/api/images/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params
  const filePath = path.join(IMAGES_DIR, folder, filename)

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("❌ Virhe poistettaessa kuvaa:", err.message)
      return res.status(500).json({ error: "Kuvan poisto epäonnistui" })
    }

    console.log("✅ Kuva poistettu:", filePath)
    res.json({ success: true })
  })
})

// palvelimen käynnistys
app.listen(PORT, () => {
  console.log(`✅ Palvelin käynnissä http://localhost:${PORT}`)
})