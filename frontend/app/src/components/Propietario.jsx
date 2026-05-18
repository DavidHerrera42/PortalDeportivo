import { useEffect, useState } from "react";
import api from "../services/api";

export default function Propietario({ logout }) {
  const [canchas, setCanchas] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    deporte: "",
    precio: 0
  });

  const token = localStorage.getItem("token");

  // ======================
  // CARGAR CANCHAS
  // ======================
  function cargarCanchas() {
    api.get("/mis-canchas", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setCanchas(res.data))
    .catch(err => console.log(err.response?.data || err.message));
  }

  useEffect(() => {
    cargarCanchas();
  }, []);

  // ======================
  // CREAR CANCHA
  // ======================
  function crearCancha() {
    api.post("/canchas", form, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setForm({
        nombre: "",
        ubicacion: "",
        deporte: "",
        precio: 0
      });

      cargarCanchas();
    })
    .catch(err => console.log(err.response?.data || err.message));
  }

  // ======================
  // ELIMINAR CANCHA
  // ======================
  function eliminarCancha(id) {
    api.delete(`/canchas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setCanchas(canchas.filter(c => c.id !== id));
    })
    .catch(err => console.log(err.response?.data || err.message));
  }

  // ======================
  // UI
  // ======================
  return (
    <div style={{ padding: "20px" }}>
      <h2>🏟 Dashboard Propietario</h2>

      <button onClick={logout}>Cerrar sesión</button>

      <h3>Crear cancha</h3>

      <input
        placeholder="Nombre"
        value={form.nombre}
        onChange={e => setForm({ ...form, nombre: e.target.value })}
      />

      <input
        placeholder="Ubicación"
        value={form.ubicacion}
        onChange={e => setForm({ ...form, ubicacion: e.target.value })}
      />

      <input
        placeholder="Deporte"
        value={form.deporte}
        onChange={e => setForm({ ...form, deporte: e.target.value })}
      />

      <input
        type="number"
        placeholder="Precio"
        value={form.precio}
        onChange={e => setForm({ ...form, precio: Number(e.target.value) })}
      />

      <button onClick={crearCancha}>Crear</button>

      <h3>Mis canchas</h3>

      {canchas.length === 0 ? (
        <p>No tienes canchas</p>
      ) : (
        canchas.map(c => (
          <div
            key={c.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px"
            }}
          >
            <h3>{c.nombre}</h3>
            <p>📍 {c.ubicacion}</p>
            <p>⚽ {c.deporte}</p>
            <p>💰 ${c.precio}</p>

            <button
              onClick={() => eliminarCancha(c.id)}
              style={{
                marginTop: "8px",
                background: "red",
                color: "white",
                border: "none",
                padding: "6px",
                cursor: "pointer"
              }}
            >
              Eliminar cancha
            </button>
          </div>
        ))
      )}
    </div>
  );
}