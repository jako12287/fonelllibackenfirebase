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
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDk1qjgbOnyPitz\nn5/6XSQHaDy066tDl6Lx0794RsPaAMGxY66+Pc5vQieNAwMK//wGbBufxPxC1b8t\nNH/VwdJKjaW+sRRlIHRo+5OTOkuOQBuh1qig3sCK0cOSUt7p0hQ4M0yTosMmEDP/\nqIjQcUoCFStlUQztf0crTHPspOwHdvVH8kSVKl2E8lzvaPTJE8/Sm2eF5vNRqWR0\n6AX0vSvze+monju09AY2bt/J5PJv41Qnhwi+OmKH+0+zsPuzfCHipqjgXTxeoTXo\nt7dTlQKHLCw+KEdpd2r0+NT77FVQXWhBUDi1kQIeNpEQ1KDf3gk4zOKYRM6NpOQL\nouHkqyFBAgMBAAECggEAGC1FslBPdzRySsj2kfD9OXsdzs+HTKDcqkgA1qhDUOj7\njc5GS/sjsEWBADjtPWBGNDd/w6WAMV97zz7YsrDDkvTcKgVzbiu7oMvTj559FQ5Y\n3QRc1II0PXZj/zWaL4HuePGSiZaMn5zeoYggzETr2MR7zTx+7SihUEXHiZzzAuav\nW+oIhh9eoILVhfpBhAAdvi+aht0pPq3+/sQE+0Qms4HForAalhxeBzXa2VXXMVDQ\n2KDKW/e5EaJMHmes6ur6aMcAp2FYrrqilHdTh3wkjj8qxChKfhBXkoHasBns0o9/\nh3ZO5Lko+yL4cKPnFZUK0cacI0mQJq6tOBDkFYx+QQKBgQD8B7m6JOme3R7i4/QJ\n2QZvHKYFqWLx7DJ59QAt0AH8IXb4QapIyYsb06zDV/lu6QivbMSmtYxb4FwiFACz\nZUrxiT5g9ujW7y4SDZZMrRif1GEJgo9pivHn0gJxwCSg/t7TeWgB0o8aDGbbXHLl\nE14GYXrM7ZigMIlxsPDDyy9WbQKBgQDocWrOwjBNFFMII2xb1+K4eSAYtjkrG4wA\np7mQS2/WW9YqxFshRoyzPOcCAJwTmqvUce+s1sNukn8rO0coHfvAQbFJTYDRGPVi\nTKQBP2ruz6R/ojHWF4C4H83SOkdM7J7kYoiW53E0qpXAg9xYgkD+mI/VHatQhH1a\nvPctY9oBpQKBgQDPETXaJzu+p2QZ/Dnj4Wh03+/T1QCTTYGHS/EysqT+1yvc+m6C\n0Pw3B6n48Q3hvxrArre/VIgWcHaiFRciTYXOfvk+R360IN0UPg+PvePuZVq4qolT\nqLHpylTxynENyXmf/C6k2K90Ml5LumA3r7rfuTVgq5Frg5VZUIvwAb9J3QKBgFFG\nDuV6aq8Y0yt+T04RvzlnSLy7QmP7Psmf27dDWThnZgwQGhkZdOra+Z7unaQRKdGf\ngQE7GpxX5tUz5d52FWeU0KtjyQ3Tn0EesR2qkfYsbkUebjSAhUZcAHhoXjPcbHZI\nqZ+yDxguKSxmLq5X5OfgajJHLHZ7zOTkO70IM9rtAoGAC55r8fngrl4Qcvdpl6XF\nayDREKY47VI0a3gu6wTa4H+XlvpecUwSWSnxKHWnp+WOj5eWzCRzlDNDIBnEENuO\n7kMJGfUNI22m4fLMji6Ro8erY83WSQWTQiaaqqx/eH/xk1ogQoHW18koh1+fxQQl\nFZdReaWKb43D9t68d8bysLo=\n-----END PRIVATE KEY-----\n",
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};
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
