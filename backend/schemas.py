from pydantic import BaseModel, EmailStr
from datetime import date, time

class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: str

class Login(BaseModel):
    email: EmailStr
    password: str

class CanchaCreate(BaseModel):
    nombre: str
    ubicacion: str
    deporte: str
    precio: int

class CanchaUpdate(BaseModel):
    nombre: str
    ubicacion: str
    deporte: str
    precio: int

class ReservaCreate(BaseModel):
    fecha: date
    hora_inicio: time
    hora_fin: time
    cancha_id: int