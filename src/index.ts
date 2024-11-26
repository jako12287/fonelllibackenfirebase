import express from "express";
import RouterWelcome from "./routes/wellcome.route";
import RouterRegister from "./routes/users.route";
import RouterTestStatusDB from "./routes/testStatusBD.route";
import RouterLogin from "./routes/login.route";
import * as dotenv from "dotenv";
dotenv.config();

const admin = require("firebase-admin");

const app = express();

const serviceAccount = require("../config/fonelli-firebase-adminsdk-ns2yg-a98e4d4a16.json");
const PORT = process.env.PORT;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.URIDATABASE,
});

app.use(express.json());
app.use(RouterWelcome);
app.use(RouterRegister);
app.use(RouterTestStatusDB);
app.use(RouterLogin);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
