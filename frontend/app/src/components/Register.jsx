import { useState } from "react";
import api from "../services/api";

export default function Register({ onGoLogin }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario"
  });

  function register() {
    api.post("/usuarios", form)
      .then(() => {
        alert("Usuario creado");
        onGoLogin();
      })
      .catch(err => {
        console.log(err.response?.data || err);
        alert("Error al registrar");
      });
  }

  return (
    <div style={styles.container}>
      <h2>Registro</h2>

      <input
        style={styles.input}
        placeholder="Nombre"
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />

      <input
        style={styles.input}
        placeholder="Correo"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <select
        style={styles.input}
        onChange={(e) => setForm({ ...form, rol: e.target.value })}
      >
        <option value="usuario">Usuario</option>
        <option value="propietario">Propietario</option>
      </select>

      <button style={styles.button} onClick={register}>
        Crear cuenta
      </button>

      <p style={{ marginTop: "10px", cursor: "pointer" }} onClick={onGoLogin}>
        Ya tengo cuenta
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