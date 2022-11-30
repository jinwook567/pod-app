export interface AccessTokenResponse {
  access_token: string;
  expires_at: Date;
  refresh_token: string;
  refresh_token_expires_at: Date;
  client_id: string;
  mall_id: string;
  user_id: string;
  scopes: string[];
  issued_at: Date;
}

export interface AuthQuery {
  mall_id: string;
  user_id: string;
  user_name: string;
  user_type: "P";
}

export interface UserSession
  extends AuthQuery,
    Pick<
      AccessTokenResponse,
      "access_token" | "expires_at" | "refresh_token" | "refresh_token_expires_at"
    > {}
