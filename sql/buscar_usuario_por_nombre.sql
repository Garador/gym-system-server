SELECT documento.contenido, documento.prefijo,
usuario.nombre, usuario.apellido
FROM usuario
LEFT JOIN documento
WHERE
(usuario.nombre = "JOSE"
AND usuario.apellido = "HERNANDEZ")
OR
(usuario.nombre = "CARLOS"
AND usuario.apellido = "GONZALEZ")
AND documento.usuario = usuario.usuario

ORDER BY apellido DESC