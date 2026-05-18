import { useEffect, useState } from "react";
import api from "../services/api";

export default function Usuario({ logout }) {
  const [canchas, setCanchas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [fecha, setFecha] = useState("");
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [reservas, setReservas] = useState([]);

  const token = localStorage.getItem("token");

  // ======================
  // CARGAR CANCHAS
  // ======================
  useEffect(() => {
    api.get("/canchas")
      .then(res => setCanchas(res.data))
      .catch(err => console.log(err));
  }, []);

  // ======================
  // CARGAR MIS RESERVAS
  // ======================
  useEffect(() => {
    if (!token) return;

    api.get("/mis-reservas", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setReservas(res.data))
    .catch(err => console.log(err));
  }, []);

  // ======================
  // DISPONIBILIDAD
  // ======================
  function verDisponibilidad(canchaId, fechaSel) {
    api.get(`/canchas/${canchaId}/disponibilidad`, {
      params: { fecha: fechaSel }
    })
    .then(res => setDisponibilidad(res.data))
    .catch(err => console.log(err));
  }

  // ======================
  // CREAR RESERVA
  // ======================
  function crearReserva(horaInicio, horaFin) {
    api.post("/reservas", {
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      cancha_id: seleccionada.id
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      console.log("RESERVA OK:", res.data);

      verDisponibilidad(seleccionada.id, fecha);

      // refrescar reservas
      return api.get("/mis-reservas", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    })
    .then(res => setReservas(res.data))
    .catch(err => console.log(err.response?.data || err.message));
  }

  // ======================
  // ELIMINAR RESERVA
  // ======================
  function eliminarReserva(id) {
    api.delete(`/reservas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setReservas(reservas.filter(r => r.id !== id));
    })
    .catch(err => console.log(err.response?.data || err.message));
  }

  // ======================
  // UI
  // ======================
  return (
    <div style={{ padding: "20px" }}>
      <h2>🏟 Panel Usuario</h2>

      <button onClick={logout}>Cerrar sesión</button>

      {/* CANCHAS */}
      {canchas.map(c => (
        <div
          key={c.id}
          onClick={() => {
            setSeleccionada(c);
            setDisponibilidad([]);
          }}
          style={{
            border: "1px solid #ccc",
            marginBottom: "10px",
            padding: "10px",
            cursor: "pointer"
          }}
        >
          <h3>{c.nombre}</h3>
          <p>{c.ubicacion}</p>
          <p>{c.deporte}</p>
          <p>${c.precio}</p>
        </div>
      ))}

      {/* DISPONIBILIDAD */}
      {seleccionada && (
        <div>
          <h3>Reservar {seleccionada.nombre}</h3>

          <input
            type="date"
            onChange={(e) => {
              setFecha(e.target.value);
              verDisponibilidad(seleccionada.id, e.target.value);
            }}
          />

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {disponibilidad.map((h, i) => (
              <div
                key={i}
                onClick={() => h.disponible && crearReserva(h.inicio, h.fin)}
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  background: h.disponible ? "#c8f7c5" : "#f7c5c5",
                  cursor: h.disponible ? "pointer" : "not-allowed"
                }}
              >
                {h.inicio} - {h.fin}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESERVAS */}
      <div style={{ marginTop: "30px" }}>
        <h3>📅 Mis reservas</h3>

        {reservas.length === 0 ? (
          <p>No tienes reservas</p>
        ) : (
          reservas.map(r => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}
            >
              <p>📅 {r.fecha}</p>
              <p>
                🕒 {String(r.hora_inicio).slice(0, 5)} -{" "}
                {String(r.hora_fin).slice(0, 5)}
              </p>

              <button onClick={() => eliminarReserva(r.id)}>
                Eliminar reserva
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}