import express from "express";
import RouterWelcome from "./routes/wellcome.route";
import RouterRegister from "./routes/registerUsers.route";
const admin = require("firebase-admin");

const app = express();

const serviceAccount = require("../config/fonelli-firebase-adminsdk-ns2yg-55006cb732.json");
const PORT = 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fonelli-default-rtdb.firebaseio.com/",
});

app.get("/testbd", (req, res) => {
  res.send("Firebase conectado correctamente.");
});

app.use(express.json());
app.use(RouterWelcome);
app.use(RouterRegister);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
