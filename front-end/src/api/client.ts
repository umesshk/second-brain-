import axios from "axios";
import { API_ORIGIN } from "../config";

export const api = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
