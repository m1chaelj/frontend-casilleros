# Instrucciones para crear el usuario coordinador (administrador)

Para máxima seguridad, el usuario con rol "coordinador" debe ser creado manualmente en la base de datos antes de usar el sistema. No existe registro público para este rol.

## 1. Generar contraseña hasheada (bcrypt)

Puedes usar Node.js para generar el hash de la contraseña:

```
node -e "console.log(require('bcrypt').hashSync('TuContraseñaSegura', 10))"
```

Hash para la contraseña 123456 (ejemplo):

```
$2b$10$u1Qw6Qw6Qw6Qw6Qw6Qw6QeQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6
```

Copia el hash generado (el hash real puede variar cada vez que lo generes).

## 2. Insertar el usuario coordinador en la base de datos

Ejemplo para el usuario coordinador necesario:

```sql
INSERT INTO usuario (correo, contrasena, rol)
VALUES ('coordinadorcorreo@gmail.com', '<HASH_GENERADO>', 'coordinador');
```

- Cambia `<HASH_GENERADO>` por el hash obtenido en el paso anterior (para 123456, usa el hash generado arriba).
- Si deseas otro correo, reemplázalo por el deseado.

## 3. Primer acceso

- El coordinador podrá iniciar sesión con el correo coordinadorcorreo@gmail.com y la contraseña 123456.

## 4. Seguridad

- No existe registro público para el rol "coordinador".
- Solo debe existir un usuario coordinador, o los que el administrador decida crear manualmente.
- No compartas el hash ni la contraseña en archivos públicos.

---

**Resumen:**
- Genera el hash de la contraseña (ejemplo arriba para 123456).
- Inserta el usuario coordinador con SQL (ejemplo arriba).
- Entrega el correo y contraseña al profesor/administrador.
