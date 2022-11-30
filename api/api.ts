import axios from "axios";

const mallId = "skrrr";

export const getAuthenticationCode = () => {
  return axios.get(`https://${mallId}.cafe24api.com/api/v2/oauth/authorize`, {
    params: {
      client_id: process.env.CLIENT_ID,
      state: "printing_app",
      redirect_uri: "https://7bfb-112-157-44-232.ngrok.io",
      scope: "mall.read_application,mall.write_application",
    },
  });
};

export const getAccessToken = () => {
  return axios.post(`https://${mallId}.cafe24api.com/api/v2/oauth/token`);
};
