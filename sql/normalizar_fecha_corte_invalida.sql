UPDATE membresia 
SET fecha_corte = "1980-02-01 00:00:00.000"
WHERE DATE(membresia.fecha_corte) IS NULL