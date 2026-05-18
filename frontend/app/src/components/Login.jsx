import { useState } from "react";
import api from "../services/api";

export default function Login({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    api.post("/login", new URLSearchParams({
      username: email,
      password: password
    }))
      .then(res => {
        onLogin(res.data);
      })
      .catch(err => {
        console.log(err.response?.data || err);
        alert("Error al iniciar sesión");
      });
  }

  return (
    <div style={styles.container}>
      <h2>Iniciar sesión</h2>

      <input
        style={styles.input}
        placeholder="Correo"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.button} onClick={login}>
        Entrar
      </button>

      <p style={{ marginTop: "10px", cursor: "pointer" }} onClick={onGoRegister}>
        Crear cuenta
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "300px",
    margin: "100px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    textAlign: "center"
  },
  input: {
    width: "100%",
    margin: "8px 0",
    padding: "8px"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  }
};