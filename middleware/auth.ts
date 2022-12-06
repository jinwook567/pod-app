import { RequestHandler } from "express";
import { AuthQuery, UserSession } from "../types/auth";
import { REDIRECT_URL } from "../constant";
import { MakePromiseMiddleware } from "../types/utils";
import { getCurrentPath } from "../utils";
import url from "url";
import { axios, getAccessToken, getAccessTokenUsingRefreshToken } from "../api/api";

type EmptyAuthQuery = {
  [k in keyof AuthQuery]: undefined;
};

export const checkTokenExpired = (token_expires_at: Date) => {
  return new Date(token_expires_at).getTime() - new Date().getTime() < 60000;
};

//refresh_token이 존재하며, token만 expired 되었을 때
export const makeGetAccessTokenUsingRefreshTokenMiddleware: MakePromiseMiddleware<UserSession> =
  (user) => async (req, res, next) => {
    try {
      const response = await getAccessTokenUsingRefreshToken(user.refresh_token);
      const { access_token, expires_at, refresh_token, refresh_token_expires_at } = response.data;
      user = { ...user, access_token, expires_at, refresh_token, refresh_token_expires_at };

      next();
    } catch (e) {
      next(e);
    }
  };

//user가 없거나, refresh token도 만료되었을 때
export const setTempUserMiddleware: RequestHandler = (req, res, next) => {
  try {
    const { mall_id, user_id, user_name, user_type } = req.query as unknown as
      | AuthQuery
      | EmptyAuthQuery;

    if (!mall_id || !user_id || !user_name || !user_type) {
      res.redirect("/error");
      return;
    }

    req.session.tempUser = { mall_id, user_id, user_name, user_type };
    next();
  } catch (e) {
    next(e);
  }
};

export const makeGetAccessTokenMiddleware: MakePromiseMiddleware<AuthQuery> =
  (tempUser) => async (req, res, next) => {
    try {
      const { code } = req.query as { code: string };

      const response = await getAccessToken({ code, redirect_uri: REDIRECT_URL });

      const { access_token, expires_at, refresh_token, refresh_token_expires_at } = response.data;

      req.session.user = {
        ...tempUser,
        access_token,
        expires_at,
        refresh_token,
        refresh_token_expires_at,
      };

      next();
    } catch (e) {
      next(e);
    }
  };

export const initializeAxiosMiddleware: RequestHandler = (req, res, next) => {
  try {
    const user = req.session.user;
    const tempUser = req.session.tempUser;

    const mall_id = user?.mall_id || tempUser?.mall_id;
    if (mall_id) {
      axios.defaults.baseURL = axios.defaults.baseURL!.replace("MALL_ID", mall_id);
    }
    next();
  } catch (e) {
    next(e);
  }
};

export const isLoggedIn: RequestHandler = (req, res, next) => {
  try {
    const notLoggedInRoutes: string[] = ["/auth", "/login", "/error"];
    const currentPath = getCurrentPath(req.originalUrl);

    if (notLoggedInRoutes.includes(currentPath)) {
      next();
      return;
    }

    const user = req.session.user;

    if (user && !checkTokenExpired(user.expires_at)) {
      next();
      return;
    }

    const query = url.parse(req.originalUrl).query;
    res.redirect(`/login?${query}`);
    return;
  } catch (e) {
    next(e);
  }
};

export const isNotLoggedIn: RequestHandler = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user && !checkTokenExpired(user.expires_at)) {
      throw new Error("로그인된 유저는 접근할 수 없습니다.");
    }
    next();
  } catch (e) {
    next(e);
  }
};
