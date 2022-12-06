import url from "url";
export const getCurrentPath = (originUrl: string) => url.parse(originUrl).pathname || "/";

export const encodeBase64 = (target: string) => {
  return Buffer.from(target, "utf8").toString("base64");
};
