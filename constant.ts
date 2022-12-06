export const API_URL = "https://bbd2-218-235-22-194.ngrok.io";
export const REDIRECT_URL = encodeURI(`${API_URL}/auth`);
export const STATE = "printing_app";

export const AUTHORIZATION_CODE = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET_KEY}`;
