export default function CanchaCard({ cancha }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "12px",
      marginBottom: "10px",
      borderRadius: "10px"
    }}>
      <h3>{cancha.nombre}</h3>
      <p>📍 {cancha.ubicacion}</p>
      <p>⚽ {cancha.deporte}</p>
      <p>💰 ${cancha.precio}</p>
    </div>
  );
}