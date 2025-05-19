const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.get("/check-token", async (req, res) => {
  const { token, domain } = req.query;

  if (!token || !domain) {
    return res.status(400).json({ valid: false, message: "Token und Domain erforderlich" });
  }

  try {
    const snapshot = await db.collection("projekte")
      .where("token", "==", token)
      .where("domain", "==", domain)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return res.json({ valid: true });
    } else {
      return res.json({ valid: false });
    }
  } catch (err) {
    console.error("Fehler beim Firestore-Zugriff:", err);
    return res.status(500).json({ valid: false, error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ WebFeed API läuft auf Port ${PORT}`);
});
