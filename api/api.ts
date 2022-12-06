import Axios from "axios";
import { AUTHORIZATION_CODE } from "../constant";
import { AccessTokenResponse, UserSession } from "../types/auth";
import { encodeBase64 } from "../utils";

export const axios = Axios.create({
  baseURL: "https://MALL_ID.cafe24api.com/api/v2",
  //초기 미들웨어를 통해서 axios baseURL을 수정해줌.
});

export const getAccessTokenUsingRefreshToken = (refresh_token: UserSession["refresh_token"]) => {
  const encoded_authorization_code = encodeBase64(AUTHORIZATION_CODE);
  return axios.post<AccessTokenResponse>(
    "/oauth/token",
    { grant_type: "refresh_token", refresh_token: refresh_token },
    {
      headers: {
        Authorization: `Basic ${encoded_authorization_code}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
};

export const getAccessToken = ({ code, redirect_uri }: { code: string; redirect_uri: string }) => {
  const encoded_authorization_code = encodeBase64(AUTHORIZATION_CODE);

  return axios.post<AccessTokenResponse>(
    `oauth/token`,
    { grant_type: "authorization_code", code, redirect_uri },
    {
      headers: {
        Authorization: `Basic ${encoded_authorization_code}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
};
