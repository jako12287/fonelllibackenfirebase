import express from "express";
import RouterWelcome from "./routes/wellcome.route";
import RouterRegister from "./routes/users.route";
import RouterTestStatusDB from "./routes/testStatusBD.route";
import RouterLogin from "./routes/login.route";
import RouterOrders from "./routes/orders.route";
import * as dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const admin = require("firebase-admin");

const app = express();

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDmnoZBe3MjCL8j\nWf37imuhwENkg+0Kvjk+yF3zQoZE3HbsqX3saz8P93gxFBS9lD2E/P8aoso+4pb0\n8weEsVdzjie+MHg+fn70j+wcGCOgldLb3lxx+Y6Na6bLu8ryspM5R30vOhs3QZKf\nAW979Gzzw17OUKl9VXNgWrYR+ffaWq0OvgrSqbS7i7fs9ylsY0w/8alwMyFYyzpB\nn5XMFid0SnA6XhvGsQ/mip1njCFeYWkwjKf3sx0FaKlTI54LJO7ZPyh7aqwAIXdu\ntFqxruZJs8IahgGTT8ofg236hCv7KU214LZDDRU2xJ0ggFJXyiKoLNvvah6KGWcw\nqzXnLTH/AgMBAAECggEAFIZYSyMNcLlHDzWweCVUhfO1q8Neb33Vj3DHhJTPnJJS\nFto3P4YEYBhPJW/bMEvHG+GX/LFigy1C1ryu1x1UO9ytGdN4TpH1T5b9iKFdwZC3\nNv1ElTPRZZggPKXTUdbl0Au8qJB11DmgSHyyuA5dbszdA7F3HC7LBj2chaxz5blp\nk7GmShceU/TLLjpANy1k4D+j0HXeKh0EhCc6LXb/5izZcFy5AgaWToMLZfeQSU8+\nna3KxbTLaGerJ/haBEqJADZ7UvyOGGH8scgGiN/x6pt9KnbkNwm2O+XE+z1QUqGx\nl5fk+TxODFBFxjhf9aXTJuyepLIH52z/cAb/MwBA9QKBgQD4F2c+si9rMT2HlBIP\n+C6xkBX30XdNi8kQlTRGE+4JR/H/jjYI/LDpCwtBZfrTG06rZJAkAEvKpvnwnzMv\nC1hiSjXwWLVKBSc0Zr81/bvcq0XVMOq3PIbolxKIhjbzY2y6+D1P35Lnd6k8L63T\nsdU4LY2JB9UbadDikJwGpQ3EjQKBgQDt+Ik9zkv7ZPVD34lPM3L1BTzVeEO08BdE\ntzkd7Qu1ihfpZsoQ0PY7KmNtUyYEeXlej+5B82k4umNzvq7o+k5Ywu/w7dbGgWbX\n73CCkS0DTPxppH1gI1tm3PF08w68YFQbwjZWhDdTT8Kh9dvUw8kNQpIxd9sI/MV6\n8j9C1WLbuwKBgQDGXHAAgRfI7SX1MT7/5b/v2PS3oJNzPUEWMTYKkgTRBuVHH720\nkdYhfuMQ9ykFgd/0ygM1xcbT0Y4mBiQ2iSux6wQVl9fbxyMBkuVvleCPH6JGQ0Zo\nG80CS0hWQHnPQL++/pyHMIuU5ug5ZyXlDVsd/84asliCAqkxfc5CwdWwQQKBgA5h\n/CGBK3R5SJ2ekBT6XhNTCrc4Opdf/3gGvuwBHLkPLJzNup7Dkm5HBJVh9iVFFkHR\n3yubQ5vLICGpv7aTElMpDQl5xoZe4dFhRmKN1bOiXosgBvfdizOvXOSdoCFgjRTU\nayZVfWaKpo/VZUD5yFgF0wIsZU+ov2LL62jlrsDrAoGBAOC8/EG+PROZ2GRrgAf3\n2j4isAZiu8EXF8PGKZWE1YsGpEWCS6cM0ELvylEhvt9m7NLkdE36XvUsNzainaYs\nrS95lh/CVEDR/hHjVCZiEZWaB7SEyvQ0wVJQbJKjvl9ERXFl7AITHlB24ldtumJh\nsPVBBLW5SBFaEVKrFFqXUdJ+\n-----END PRIVATE KEY-----\n",
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};
// const serviceAccount = require("../config/fonelli-firebase-adminsdk-ns2yg-a98e4d4a16.json");
const PORT = process.env.PORT;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.URIDATABASE,
});
app.use(cors());
app.use(express.json());
app.use(RouterWelcome);
app.use(RouterRegister);
app.use(RouterTestStatusDB);
app.use(RouterLogin);
app.use(RouterOrders);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
