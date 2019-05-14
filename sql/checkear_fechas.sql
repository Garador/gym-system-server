SELECT count(*) FROM membresia WHERE DATE(membresia.fecha_corte) IS NULL
OR DATE(membresia.fecha_inscripcion) IS NULL