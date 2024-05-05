"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

const baseUrl = process.env.API_URL;
const baseHeaders: any = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT",
  "Access-Control-Allow-Headers":
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  "Content-Type": "application/json",
};
const authTokenName = "x-auth-token";

export async function getCurrentUser() {
  const token = cookies().get(authTokenName);
  if (token) return jwtDecode(token.value);
  return null;
}

export async function makeRequest(
  extension: string,
  method: string,
  updateToken?: boolean,
  body?: Object
) {
  const headers = { ...baseHeaders };
  const existingToken = cookies().get(authTokenName);
  if (existingToken) headers[authTokenName] = existingToken.value;

  const options: RequestInit = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(baseUrl + extension, options);

  let token;
  if (updateToken) {
    token = res.headers.get(authTokenName);
    if (token) cookies().set(authTokenName, token);
    else cookies().delete(authTokenName);
  }

  let resBody;
  try {
    resBody = await res.json();
  } catch (error) {}
  return { ok: res.ok, status: res.status, body: resBody, token };
}
