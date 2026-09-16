import axios from "axios";

/** Not tied to any one account name. */
export const STORAGE_KEY = "h75_user_id";

const api = axios.create({
  baseURL: "/api"
});

api.interceptors.request.use(config => {
  const userId = localStorage.getItem(STORAGE_KEY);

  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  return config;
});

export default api;
