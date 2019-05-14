UPDATE membresia 
SET fecha_inscripcion = "1980-01-01 00:00:00.000"
WHERE DATE(membresia.fecha_inscripcion) IS NULL