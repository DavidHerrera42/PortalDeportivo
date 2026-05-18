from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

SECRET_KEY = "clave_super_secreta"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme)
):

    credenciales_exception = HTTPException(
        status_code=401,
        detail="Token inválido"
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")
        rol = payload.get("rol")

        if email is None:
            raise credenciales_exception

        return {
            "email": email,
            "rol": rol
        }

    except JWTError:
        raise credenciales_exception