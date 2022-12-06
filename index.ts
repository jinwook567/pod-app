import dotenv from "dotenv";
dotenv.config();

import express, { ErrorRequestHandler, Request } from "express";
import session from "express-session";
import {
  checkTokenExpired,
  initializeAxiosMiddleware,
  isLoggedIn,
  isNotLoggedIn,
  makeGetAccessTokenMiddleware,
  makeGetAccessTokenUsingRefreshTokenMiddleware,
  setTempUserMiddleware,
} from "./middleware/auth";
import { REDIRECT_URL, STATE } from "./constant";

const app = express();
const port = 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(initializeAxiosMiddleware);
app.use(isLoggedIn);

app.get("/", async (req, res, next) => {
  try {
    const user = req.session.user!;
    const message = `hello ${user.user_name}`;

    res.send(message);
  } catch (e) {
    next(e);
  }
});

app.get("/login", isNotLoggedIn, async (req, res, next) => {
  try {
    const user = req.session.user;

    if (user && !checkTokenExpired(user.refresh_token_expires_at)) {
      const getAccessTokenUsingRefreshTokenMiddleware =
        makeGetAccessTokenUsingRefreshTokenMiddleware(user);

      await getAccessTokenUsingRefreshTokenMiddleware(req, res, next);
      res.redirect("/");
    } else {
      setTempUserMiddleware(req, res, next);

      const mall_id = req.session.tempUser!.mall_id;
      res.redirect(
        `https://${mall_id}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URL}&scope=mall.read_application,mall.write_application`
      );
    }
  } catch (e) {
    next(e);
  }
});

app.get("/auth", async (req: Request<{}, {}, {}, { code: string }>, res, next) => {
  try {
    const tempUser = req.session.tempUser;
    if (!tempUser) {
      throw new Error("login 페이지를 경유하지 않았습니다.");
    }

    const getAccessTokenMiddleware = makeGetAccessTokenMiddleware(tempUser);
    await getAccessTokenMiddleware(req, res, next);

    res.redirect("/");
  } catch (e) {
    next(e);
  }
});

app.get("/error", async (req, res) => {
  res.send("error page");
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.response) {
    console.error(err.response.data);
    return;
  }

  console.error(err);
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
