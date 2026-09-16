import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api, { STORAGE_KEY } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
      setChecking(false);
      return;
    }

    api
      .get("/auth/me")
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setChecking(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem(STORAGE_KEY, data.user.id);
    setUser(data.user);
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password
    });

    localStorage.setItem(STORAGE_KEY, data.user.id);
    setUser(data.user);
  }

  /** Renames the account. The whole UI is driven off this value. */
  async function updateName(name) {
    const { data } = await api.patch("/auth/me", { name });
    setUser(data);
    return data;
  }

  /** Changes the morning reminder time, or turns it off. */
  async function updateReminder(patch) {
    const { data } = await api.patch("/reminders", patch);
    setUser(prev => ({ ...prev, reminder: data }));
    return data;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        checking,
        login,
        register,
        updateName,
        updateReminder,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
