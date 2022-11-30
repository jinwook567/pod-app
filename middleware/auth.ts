//token이 만료 기간이 지났다면 refresh token을 이용해서
//token이 없다면 새롭게 토큰을 발급받아야한다. = 세션에 유저가 없다면. 이 과정은 브라우저 이동을 통해서만 가능하다.
//1. 세션에 유저가 없다면
//2. refresh token의 발급 일자가 2주가 지났다면.
import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import { UserSession, AccessTokenResponse, AuthQuery } from "../types/auth";
import { REDIRECT_URL, API_URL, STATE, AUTHORIZATION_CODE } from "../constant";
import url from "url";

type EmptyAuthQuery = {
  [k in keyof AuthQuery]: undefined;
};

const notLoggedInRoutes: string[] = ["/auth", "/error"];

//code라는 쿼리를 다른 곳에서 쓸 수도 있고, cafe24에서 redirect_uri를 제공하기에 token generate는 다른 라우터에서 처리하도록 함.
export async function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  try {
    const currentPath = url.parse(req.originalUrl).pathname || "/";

    if (notLoggedInRoutes.includes(currentPath)) {
      next();
      return;
    }

    const user = req.session.user;

    const isRefreshTokenExpired =
      user && user.refresh_token_expires_at.getTime() - new Date().getTime() < 60000;
    const isTokenExpired = user && user.expires_at.getTime() - new Date().getTime() < 60000;

    if (!user || isRefreshTokenExpired) {
      const { mall_id, user_id, user_name, user_type } = req.query as unknown as
        | AuthQuery
        | EmptyAuthQuery;

      if (!mall_id) {
        res.redirect(`${API_URL}/error`);
        return;
      }

      req.session.tempUser = { mall_id, user_id, user_name, user_type };
      res.redirect(
        `https://${mall_id}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URL}&scope=mall.read_application,mall.write_application`
      );
      return;
    }

    if (isTokenExpired) {
      const response = await getRefreshToken({
        mall_id: user.mall_id,
        refresh_token: user.refresh_token,
      });
      const { access_token, expires_at, refresh_token, refresh_token_expires_at } = response.data;

      user.access_token = access_token;
      user.expires_at = expires_at;
      user.refresh_token = refresh_token;
      user.refresh_token_expires_at = refresh_token_expires_at;
    }

    next();
  } catch (e) {
    next(e);
  }
}

async function getRefreshToken({
  mall_id,
  refresh_token,
}: {
  mall_id: AccessTokenResponse["mall_id"];
  refresh_token: AccessTokenResponse["refresh_token"];
}) {
  const encoded_authorization_code = encodeBase64(AUTHORIZATION_CODE);

  return axios.post<AccessTokenResponse>(
    `https://${mall_id}.cafe24api.com/api/v2/oauth/token`,
    { grant_type: "refresh_token", refresh_token: refresh_token },
    {
      headers: {
        Authorization: `Basic ${encoded_authorization_code}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
}

export async function getToken({
  mall_id,
  code,
  redirect_uri,
}: {
  mall_id: AccessTokenResponse["mall_id"];
  code: string;
  redirect_uri: string;
}) {
  const encoded_authorization_code = encodeBase64(AUTHORIZATION_CODE);

  return axios.post<AccessTokenResponse>(
    `https://${mall_id}.cafe24api.com/api/v2/oauth/token`,
    { grant_type: "authorization_code", code, redirect_uri },
    {
      headers: {
        Authorization: `Basic ${encoded_authorization_code}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
}

const encodeBase64 = (target: string) => {
  return Buffer.from(target, "utf8").toString("base64");
};
