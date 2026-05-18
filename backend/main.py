from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

from auth import (
    hash_password,
    verify_password,
    create_access_token
)

from security import obtener_usuario_actual
from database import engine, Base, get_db
from datetime import date, time

import models
import schemas

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# --------------------------
# HELPERS
# --------------------------
def require_role(usuario, roles):
    return usuario["rol"] in roles


# --------------------------
# USUARIOS
# --------------------------
@app.post("/usuarios")
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):

    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password=hash_password(usuario.password),
        rol=usuario.rol
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {"mensaje": "Usuario creado"}


# --------------------------
# LOGIN
# --------------------------
@app.post("/login")
def login(datos: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == datos.username
    ).first()

    if not usuario or not verify_password(datos.password, usuario.password):
        return {"error": "Credenciales inválidas"}

    token = create_access_token({
        "sub": usuario.email,
        "rol": usuario.rol
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": usuario.rol
    }


# --------------------------
# CANCHAS (CREAR)
# --------------------------
@app.post("/canchas")
def crear_cancha(
    cancha: schemas.CanchaCreate,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual)
):

    if not require_role(usuario, ["propietario", "admin"]):
        return {"error": "No autorizado"}

    propietario = db.query(models.Usuario).filter(
        models.Usuario.email == usuario["email"]
    ).first()

    nueva = models.Cancha(
        nombre=cancha.nombre,
        ubicacion=cancha.ubicacion,
        deporte=cancha.deporte,
        precio=cancha.precio,
        propietario_id=propietario.id
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return nueva


# --------------------------
# CANCHAS (EDITAR)
# --------------------------
@app.put("/canchas/{cancha_id}")
def editar_cancha(
    cancha_id: int,
    data: schemas.CanchaUpdate,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual)
):

    cancha = db.query(models.Cancha).filter(models.Cancha.id == cancha_id).first()

    if not cancha:
        return {"error": "No existe"}

    propietario = db.query(models.Usuario).filter(
        models.Usuario.email == usuario["email"]
    ).first()

    if cancha.propietario_id != propietario.id:
        return {"error": "No autorizado"}

    cancha.nombre = data.nombre
    cancha.ubicacion = data.ubicacion
    cancha.deporte = data.deporte
    cancha.precio = data.precio

    db.commit()

    return {"mensaje": "Actualizada"}


# --------------------------
# CANCHAS (ELIMINAR)
# --------------------------
@app.delete("/canchas/{cancha_id}")
def eliminar_cancha(
    cancha_id: int,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    cancha = db.query(models.Cancha).filter(
        models.Cancha.id == cancha_id
    ).first()

    if not cancha:
        return {"error": "No existe"}

    usuario_db = db.query(models.Usuario).filter(
        models.Usuario.email == usuario["email"]
    ).first()

    if usuario["rol"] != "admin" and cancha.propietario_id != usuario_db.id:
        return {"error": "No autorizado"}

    db.delete(cancha)
    db.commit()

    return {"mensaje": "Cancha eliminada"}


# --------------------------
# RESERVAS
# --------------------------
@app.post("/reservas")
def crear_reserva(
    reserva: schemas.ReservaCreate,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual)
):

    if not require_role(usuario, ["usuario"]):
        return {"error": "Solo usuarios pueden reservar"}

    usuario_db = db.query(models.Usuario).filter(
        models.Usuario.email == usuario["email"]
    ).first()

    conflicto = db.query(models.Reserva).filter(
        models.Reserva.cancha_id == reserva.cancha_id,
        models.Reserva.fecha == reserva.fecha,
        models.Reserva.hora_inicio < reserva.hora_fin,
        models.Reserva.hora_fin > reserva.hora_inicio
    ).first()

    if conflicto:
        return {"error": "Horario ocupado"}

    nueva = models.Reserva(
        fecha=reserva.fecha,
        hora_inicio=reserva.hora_inicio,
        hora_fin=reserva.hora_fin,
        usuario_id=usuario_db.id,
        cancha_id=reserva.cancha_id
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return nueva


# --------------------------
# MIS RESERVAS
# --------------------------
@app.get("/mis-reservas")
def mis_reservas(usuario=Depends(obtener_usuario_actual), db: Session = Depends(get_db)):

    usuario_db = db.query(models.Usuario).filter(
        models.Usuario.email == usuario["email"]
    ).first()

    return db.query(models.Reserva).filter(
        models.Reserva.usuario_id == usuario_db.id
    ).all()


# --------------------------
# DISPONIBILIDAD
# --------------------------
@app.get("/canchas/{cancha_id}/disponibilidad")
def disponibilidad(cancha_id: int, fecha: date, db: Session = Depends(get_db)):

    reservas = db.query(models.Reserva).filter(
        models.Reserva.cancha_id == cancha_id,
        models.Reserva.fecha == fecha
    ).all()

    HORARIOS = [(h, h+1) for h in range(8, 22)]

    def ocupado(inicio, fin):
        for r in reservas:
            if not (fin <= r.hora_inicio or inicio >= r.hora_fin):
                return True
        return False

    return [
        {
            "inicio": time(h[0], 0),
            "fin": time(h[1], 0),
            "disponible": not ocupado(time(h[0], 0), time(h[1], 0))
        }
        for h in HORARIOS
    ]


# --------------------------
# MIS CANCHAS
# --------------------------
@app.get("/mis-canchas")
def mis_canchas(usuario=Depends(obtener_usuario_actual), db: Session = Depends(get_db)):

    if not require_role(usuario, ["propietario", "admin"]):
        return {"error": "No autorizado"}

    propietario = db.query(models.Usuario).filter(
        models.Usuario.email == usuario["email"]
    ).first()

    return db.query(models.Cancha).filter(
        models.Cancha.propietario_id == propietario.id
    ).all()



@app.get("/canchas")
def listar_canchas(db: Session = Depends(get_db)):
    return db.query(models.Cancha).all()



@app.delete("/reservas/{reserva_id}")
def eliminar_reserva(
    reserva_id: int,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    usuario_db = db.query(models.Usuario).filter(
        models.Usuario.email == usuario["email"]
    ).first()

    reserva = db.query(models.Reserva).filter(
        models.Reserva.id == reserva_id
    ).first()

    if not reserva:
        return {"error": "No existe la reserva"}

    # solo dueño puede eliminar su reserva
    if reserva.usuario_id != usuario_db.id:
        return {"error": "No autorizado"}

    db.delete(reserva)
    db.commit()

    return {"mensaje": "Reserva eliminada"}