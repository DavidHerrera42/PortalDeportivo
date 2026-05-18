import { useState, useEffect } from "react";
import api from "./services/api";
import Login from "./components/Login";
import Register from "./components/Register";
import Propietario from "./components/Propietario";
import Usuario from "./components/Usuario";

function App() {
  const [screen, setScreen] = useState("login");

  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    rol: localStorage.getItem("rol")
  });

  function handleLogin(data) {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("rol", data.rol);

    setAuth({
      token: data.access_token,
      rol: data.rol
    });

    setScreen("app");
  }

  function logout() {
    localStorage.clear();
    setAuth({ token: null, rol: null });
    setScreen("login");
  }

  useEffect(() => {
    if (auth.token) {
      api.get("/canchas")
        .then(res => console.log("CARGA OK:", res.data))
        .catch(err => console.log(err));
    }
  }, [auth]);

  if (screen === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onGoRegister={() => setScreen("register")}
      />
    );
  }

  if (screen === "register") {
    return (
      <Register onGoLogin={() => setScreen("login")} />
    );
  }

  if (!auth.token) {
    return <div>No autorizado</div>;
  }

  if (auth.rol === "propietario") {
    return <Propietario logout={logout} />;
  }

  if (auth.rol === "usuario") {
    return <Usuario logout={logout} />;
  }

  return <div>Cargando...</div>;
}

export default App;