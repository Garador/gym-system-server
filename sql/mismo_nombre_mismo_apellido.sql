SELECT usuario, nombre, apellido,
       count(*) AS conteo
FROM usuario
GROUP BY nombre, apellido
HAVING conteo > 1
ORDER BY conteo DESC