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
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCesQfnyTa+ZedG\nO7sPlaCtZZ5Y2qZGDl++wxQU0DnqLtBSkaCnHXYn4g01Lde9BowlgUgxXgkF7LMw\ntyzSpjxp/wdnBcCEtxuU4YePUx82nIR3rZbRvwslLpjyb3FKN2JuDXYagIse3R2E\nKWlRBj2cBb8BzmRYzLdu/fBO18kt1LufpyGUqknQECayQfx09KJ9UyHLmowFICkA\nr6R/gkbDpAwcS++KV2vLTAkHFCuS7rnk5JDCWd7XM8qzX7dqUs+9qsy8c/kVQftu\n3PUjKPpzG5ej8etgk0darW2KerS/CavoYO7Y7Fu/e3guQATBD54H7szyd8ujXMDi\nPS9Kqg+bAgMBAAECggEAC2ggo1gvtGJRMrE0cjUh+ZTMwjvlQjMVgS02+LZtYBha\n84E+q2rouIrJ9dqeH7SkYKwsUXzq6FKDuhEdcOU8ga0wdDoe0bgmJjHks2t/Wnn7\nSgb5e+/GXOo+jQUJsnkzFnbaC6M8KZnHRCq3d6voXc19iPAaMm/bETVbqRWSgzxV\n/kCzyCpLn3uLuzDP5Q/StOhKsT0uatOwfu/1Cr8kIMpDU/mlvg1AeROe35SNTykx\nzJkbokWHw8JekwG/yy3BzIW5towq+ND525L0FHzgpFrMzZIT/dwk/ajViFbVDFgv\n3EuQzL5ff7vkGe/Yk+9tR0IQJAXQsZLqTIl7+zaLwQKBgQDPoWoq1kjbZGC1BX7F\nBTxHzjahShsNR6BdbK+hUYAtRl73Wt2khyP3QzIWMaR1L1XRfkCmIGotcb+h+IN/\nEAxm3TAjZOSFleosIVoZwKErebM99jEhIMcBQT2h60DxPgCNJVBRzAp6d1+JtDUN\n6b4dtNHkPzEDllnt7HnkKoJtSwKBgQDDqQMNyBI7b+HfsNHUieKq5fy42kersUbs\nf28GnpNdo7OsiLr/XIJKIEds+bmziQuFEqRAcQ0UbS9XrEHG1WXPdjAcjnmnLb57\nWGETBOvTV3ky8clQJ3z+xKu5u8/klubDnPJ4NebuffxKgABv6Gzjtroq3Sqobz3I\nURfNNQQE8QKBgEiV1ma5WOkR01kVXbcE2IkFx0VlgcWHt8FRYKjVtCifxE1W/8sn\nz2P+osDtg9/Pt4GwUGuDQ3s1m9fE6DuAYcWIJ+8Hs3gb66yX0EbWd8GaHxZXPd+l\n9Mw0gZZchuyPT2QImmauHS+pEcYzMKT3hRYfg4z2pmzpn/C0Tfx8+/G3AoGBAJif\nEJvCcb5dUpK7iaHBgMcQKWdEFV3vJcS6zq8aKReE51VxPnSNA7CwpyZxUZKjFxJR\nbUA7Lxm85Y389z4THZyLs5HC7VAj1Y6/bNF6KD4t4IOFqSPV+aF9Zfq2br7/mrgB\nh/2PBjkImzC90hl48t9ZnLRs2qaSR14nK2rNrPnxAoGBAL4kQApNE0ctZkNxSZqN\n5IOIPyFCcVPwmzERtBe7EEJNYKDG4V9nyPyUNnKhXovee7/P4UAIP7K19eiG8m15\nAgfzIj6RmYe8D4UQkkkd8O3mehQ3XcHw2tKO+MK0XqzH5Ke30Khwt+QySvanBG9Z\npcoqy89pnlN9UoavloUvVbFW\n-----END PRIVATE KEY-----\n",
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com",
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
