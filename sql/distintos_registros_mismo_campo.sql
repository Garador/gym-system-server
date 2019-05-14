SELECT count(*), membresia
FROM pago
GROUP BY membresia
HAVING COUNT(*) > 1;