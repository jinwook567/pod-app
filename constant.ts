export const API_URL = "https://7364-221-146-71-214.ngrok.io" as const;
export const REDIRECT_URL = encodeURI(`${API_URL}/auth`);
export const STATE = "printing_app";

export const AUTHORIZATION_CODE = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET_KEY}`;
