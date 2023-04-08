import express, { Request, Response } from "express";
import router from "./routes/router";

import session from "express-session";
import compression from "compression";
import connection from "../lib/connection/db";
import cors, { CorsOptions } from "cors";
import express_mysql_session from "express-mysql-session";
import { whitelist, dev } from "../lib/constants";
import cookieParser from "cookie-parser";
import compileHtml from "../lib/compileHtml";
import transporter from "../lib/transporter";
import next from "next";

const corsOptionsDelegate: cors.CorsOptionsDelegate<Request> = function (
  req: Request,
  callback
) {
  let corsOptions: CorsOptions;
  if (whitelist.includes(req.header("Origin") as string)) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

const mysqlStore = express_mysql_session(session as any);
const sessionStore = new mysqlStore({}, connection);
const sessionMiddleware = session({
  secret: process.env.SECRET_KEY as string,
  resave: false,
  name: "sid",
  store: sessionStore,
  saveUninitialized: false,
  cookie: {
    secure: !dev,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  },
});

function shouldCompress(req: Request, res: Response) {
  if (req.headers["x-no-compression"]) return false;
  return compression.filter(req, res);
}

const server = express();

// server configuration
const options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html", "png", "jpg"],
  index: false,
  maxAge: "1d",
  redirect: false,
  setHeaders(res: Response, path: string, stat: string) {
    res.set("x-timestamp", Date.now().toString());
  },
};

server.use(express.static("public", options));
server.use(compression({ filter: shouldCompress }));
server.set("trust proxy", Number(!dev));
server.use(sessionMiddleware);
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(express.json());
server.use(cors(corsOptionsDelegate));
server.use("/api", router);

server.get("/logout", async (req, res) => {
  let session_id = req.sessionID;
  let deleteQuery = `DELETE FROM sessions WHERE session_id = '${session_id}'`;
  await connection.query(deleteQuery);

  req.session.destroy((err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    return res.send("Done");
  });
});

const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;


(async () => {
  try {
    await app.prepare();

    server.get("*", (req: Request, res: Response) => {
      return handle(req, res);
    });

    server.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
    });

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();


// export default server;