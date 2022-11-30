import express, { Request } from "express";
import dotenv from "dotenv";
import session from "express-session";
import { getToken, isLoggedIn } from "./middleware/auth";
import { REDIRECT_URL } from "./constant";

const app = express();
const port = 3000;
dotenv.config();

app.use(
  session({
    secret: "pt_app",
    resave: false,
    saveUninitialized: true,
  })
);

// TODO: 이후에 클라이언트 사이드 제작이 되면, 로그인 되어있지 않다면 auth/start로 params와 함께 호출하도록 해야한다.

app.use(isLoggedIn);

app.get("/", async (req, res) => {
  try {
    const user = req.session.user;
    const message = `hello ${user!.user_name}`;
    res.send(message);
  } catch (e) {
    console.error(e);
  }
});

app.get("/auth", async (req: Request<{}, {}, {}, { code: string }>, res) => {
  try {
    const { code } = req.query;
    const tempUser = req.session.tempUser!;
    const { mall_id } = tempUser;
    const response = await getToken({ mall_id, code, redirect_uri: REDIRECT_URL });

    const { access_token, expires_at, refresh_token, refresh_token_expires_at } = response.data;
    let user = req.session.user;
    user = {
      ...tempUser,
      access_token,
      expires_at,
      refresh_token,
      refresh_token_expires_at,
    };
    console.log(response.data);
    res.send("login success");
  } catch (e) {
    console.error(e);
  }
});

app.get("/error", async (req, res) => {
  res.send("error page");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
