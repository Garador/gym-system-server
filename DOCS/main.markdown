####Iniciar el sistema
Inciar el servidor
Iniciar el cliente

####SuperAdministrador
Crear SuperAdministrador.
Actualizar SuperAdministrador.

####Administrador
Crear Administrador.
Buscar Administrador.
Actualizar Administrador.
Eliminar Administrador.
Restaurar Administrador.

####Cliente
Incorporar Cliente.
Buscar Cliente.
Actualizar Cliente.
Desincorporar Cliente.
Reincorporar Cliente.

####Pagos
Buscar Pagos.
Agregar Pagos.

####Logs
Buscar Logs.

####Exportar / Importar
Exportar Data.
Importar Data.

####Comandos del Servidor
Exportar Data
Importar Data
Traducir Archivos


#Super Administrador
##Crear SuperAdministrador
El SuperAdministrador del sistema será creado de manera inicial.
Es el encargado de crear cuentas de administración del sistema.
Para crearlo, deberá hacer lo siguiente:

1. Acceder inicialmente a "Entrar" (login).
2. En la casilla de del nombre de usuario, deberá colocar el siguiente comando:
	`create_super_admin`
3. Luego de ello, deberá insertar los datos del nuevo super-administrador y del usuario que lo utilizará, que son pedidos por el formulario. Una vez hecho esto, darle click a "Crear Super Usuario" (botón azul).
4. El mensaje de confirmación deberá aparecer arriba a la derecha.

##Actualizar super-administrador
El super-administrador, luego de creado, no podrá ser eliminado; sin embaro, podrá ser actualizado de una manera similar a como se creó (el super-administrador no puede actualizar su propio perfil de manera directa).
Para hacer esto, deberá hacer lo siguiente:

1. Acceder inicialmente a "Entrar" (login).
2. Luego, colocar en la casilla de nombre de usuario el siguiente comando:
	`update_super_admin`
En la casilla de contraseña deberá colocar la contraseña de actualización de super-usuario, dado por el siguiente patrón:
	Formato: `YYYY`\_`MM`\_`DD`\_`HH`\_`AdditionalInfo`
        Donde:
        `YYYY`: Año de la fecha del Servidor (p.e. 2018)
        `M`: Mes de la fecha del servidor en números (1 al 12)
        `D`: Día de la fecha del servidor en números (1 al 31)
        `H`: Hora de la fecha del servidor en números (0 al 23)
        `AdditionalInfo`: El RIF o la CI, dado por BaseInfo.ts, dependiendo de la hora:
        	A. Si es una hora par:	(`6.141.823`)
                B. Si es hora inpar: 	(`308091642`)
3. Luego de esto, actualizar los campos del super-administrador que desea cambiar. Estos campos no serán auto-completados por el registro de la base de datos, pero sus cambios se verán reflejados.
4. Una vez realizado los cambios deseados, debera darle al botón de actualizar.
5. El resultado se verá reflejado en la parte derecha superior de la pantalla del sistema.



#Administradores
Los administradores tienen el rol principal de actualizar a los clientes y agregar pagos.

##Crear Administrador
1. Para crear un administrador, el usuario deberá acceder como super-administrador, y generar uno desde su cuenta, ya sea accediendo desde el menú superior `Administradores -> Añadir`, o desde la pantalla principal con el botón `AGREGAR ADMIN`.
2. Luego de esto, se desplegará una pantalla donde podrá llenar los datos del administrador a generar, así como los del usuario que utilizará la cuenta.
3. Una vez llenado los datos, deberá darle click al botón de `CREAR`.
4. Un mensaje en la parte superior derecha deberá aparecer, confirmándole la creación del administrador.

##Actualizar Administrador
Para actualizar un administrador, usted deberá:
1- Acceder como un super-administrador (o poseer el rol de Actualizar Administradores y Buscar Administradores).
2- Acceder a la pantalla de modificación de administradores de la siguiente manera:
> Desde la pantalla principal, darle click al botón de "MODIFICAR ADMIN".
Desde el menú superior, click en el ítem `ACTUALIZAR` en el menú de Administradores.
Desde la pantalla de búsqueda de administradores, dándole click al botón de "modificar".

3- Deberá colocar la CI con el que se identifica al administrador actualmente.
4- Luego, darle click al botón lupa, para buscarlo.
5- Luego de cargado el administrador, podrá proceder a modificar sus datos principales.
6- Para modificar el **rol** del administrador, podrá:

>1- Minimizar la pestaña de actualización de los datos principales, por medio de un click en el botón de `+` que se encuentra a la izquierda del título del recuadro.

>2-  Maximizar la pestaña de `Roles` dándole click al botón `+` del lado izquierdo del recuadro, al lado del título de `Roles`.

>3- Modificar lo que el administrador podrá o no podrá hacer.

7- Una vez finalizada la modificación del administrador, deberá darle click al botón de actualizar perfil o actualizar rol, dependiendo de la operación que haya realizardo.

8- Debería obtener un mensaje de confirmación de lado derecho superior.

##Eliminar Administrador
1- Para eliminar un administrador, deberá acceder a su cuenta de super-administrador (o poseer el rol de eliminación de administradores), y podrá hacer lo siguiente (seleccionar una opción):
2- Desde la pantalla principal:
> 1-Darle click al botón de `ELIMINAR ADMIN`.

>2- Colocar la `CI` del administrador al que desea eliminar. Una vez colocada, darle click al botón con lupa, a la derecha, para buscar al administrador.

>3- Confirmar la eliminación.

2- Desde el Menu `Administradores` -> `Eliminar`
> 1- Colocar la CI del administrador al que desea eliminar. Una vez colocada, darle click al botón con lupa, a la derecha, para buscar al administrador.

>2- Confirmar la eliminación.

3- Desde la Búsqueda de Administradores
> 1- Darle click al botón de papelera de reciclaje, al lado del botón del registro de administrador.

> 2- Confirmar Eliminación.

**NOTA** Si el administrador ha realizado acciones en el sistema, no será eliminado por completo; en cambio, su estado pasará a 

##Buscar Administrador
1- Para buscar un administrador, deberá acceder a su cuenta de super-administrador (o poseer el rol de Actualizar Administradores y Buscar Administradores), podrá hacer lo siguiente:
2- Acceder desde el menú `Administradores`->`Buscar`.
3- Desde esta pantalla (Búsqueda de Administradores), podrá hacer lo siguiente:
> 1- Colocar datos de búsqueda relacionados para buscar al administrador por dichos datos.

> 2- Ver una ficha resumida de los detalles del administrador (Dándole click al botón con una imágen de perfil, en la acciones del registro encontrado).

> 3- Eliminar al administrador encontrado (Dándole click al botón con una imágen de papelera, en la acciones del registro encontrado).

> 4- Restaurar al administrador encontrado (Dándole click al botón con una imágen de refrescar, en la acciones del registro encontrado).

> 4- Actualizar al administrador encontrado (Dándole click al botón con un lapiz, en la acciones del registro encontrado).

##Restaurar Administrador
1- Para restaurar un administrador, deberá acceder a su cuenta de super-administrador (o poseer el rol de eliminación de administradores), y podrá hacer lo siguiente (seleccionar una opción):
2- Desde la pantalla principal:
> 1-Darle click al botón de `RESTAURAR ADMIN`.

>2- Colocar la `CI` del administrador al que desea restaurar. Una vez colocada, darle click al botón con lupa, a la derecha, para buscar al administrador.

>3- Confirmar la restauración.

2- Desde el Menu `Administradores` -> `Restaurar`
> 1- Colocar la CI del administrador al que desea restaurar. Una vez colocada, darle click al botón con lupa, a la derecha, para buscar al administrador.

>2- Confirmar la restauración.

3- Desde la Búsqueda de Administradores
> 1- Darle click al botón de refrescar, en las acciones del registro.

> 2- Confirmar Restauración.


#Clientes

##Agregar Cliente
1- Para agregar un nuevo cliente, el usuario deberá acceder con su cuenta de administrador, y podrá:
2- En la pantalla principal.

> 1- Darle click a "Incorporar"

> 2- Llenar los datos del cliente

> 3- Darle click a "Incorporar Cliente".

3- En el menú "Cliente", en la barra de navegación superior:

> 1- Darle click a "Incorporar"

> 2- Llenar los datos del cliente

> 3- Darle click a "Incorporar Cliente".

**NOTA** Sólo un cliente podrá existir con una cédula. Si ya el cliente ha sido añadido (u otro cliente con la misma cédula) , el registro no se podrá almacenar.

##Actualizar Cliente.
1- Para agregar un nuevo cliente, el usuario deberá acceder con su cuenta de administrador, y podrá:
2- En la pantalla principal.

> 1- Darle click a "Modificar"

> 2- Llenar los datos en la casilla de búsqueda por CI, y darle click al botón de lupa.

> 3- Modificar los datos del cliente

> 4- Darle click al botón de actualizar.

3- Desde la pantalla de búsqueda de cliente:

> 1- Llenar los datos respectivos al cliente.

> 2- Darle click a Buscar

> 3- En las acciones del registro, darle click al botón de lápiz.

> 4- Modificar los datos del cliente

> 5- Darle click al botón de actualizar.


##Eliminar Cliente
1- Para eliminar un nuevo cliente, el usuario deberá acceder con su cuenta de administrador, y podrá:
2- En la pantalla principal.

> 1- Darle click a "Desincorporar"

> 2- Llenar los datos en la casilla de búsqueda por CI, y darle click al botón de lupa.

> 3- Confirmar la eliminación del cliente.


3- En el menú "Cliente", en la barra de navegación superior:

> 1- Darle click a "Desincorporar"

> 2- Llenar los datos en la casilla de búsqueda por CI, y darle click al botón de lupa.

> 3- Confirmar la eliminación del cliente.


3- Desde la pantalla de búsqueda de cliente:

> 1- Llenar los datos respectivos al cliente.

> 2- Darle click a Buscar

> 3- En las acciones del registro, darle click al botón de papelera.

> 5- Confirmar la eliminación del cliente.

**NOTA** Si el cliente tiene un pago registrado en el sistema, la eliminación del cliente se realizará de manera lógica (se cambiará el estatus del cliente). Sólo los clientes eliminados lógicamente pueden ser restaurados.


##Restaurar Cliente
1- Para agregar un nuevo cliente, el usuario deberá acceder con su cuenta de administrador, y podrá:
2- En la pantalla principal.

> 1- Darle click a "Reincorporar"

> 2- Llenar los datos en la casilla de búsqueda por CI, y darle click al botón de lupa.

> 3- Confirmar la reincorporación del cliente.


3- En el menú "Cliente", en la barra de navegación superior:

> 1- Darle click a "Reincorporar"

> 2- Llenar los datos en la casilla de búsqueda por CI, y darle click al botón de lupa.

> 3- Confirmar la reincorporación del cliente.


3- Desde la pantalla de búsqueda de cliente:

> 1- Llenar los datos respectivos al cliente.

> 2- Darle click a Buscar

> 3- En las acciones del registro, darle click al botón de refrescar.

> 5- Confirmar la restauración del cliente.

**NOTA** Sólo los clientes eliminados lógicamente pueden ser restaurados.

##Buscar Cliente
1- Para buscar un cliente, deberá acceder a su cuenta de administrador, y podrá hacer lo siguiente:
2- Acceder desde el menú `Cliente`->`Buscar`.
3- Acceder desde la pantalla principal por el botón `Buscar Clientes`.
4- Desde esta pantalla (Búsqueda de Clientes), podrá hacer lo siguiente:
> 1- Colocar datos de búsqueda relacionados para buscar al cliente por dichos datos.

> 2- Ver una ficha resumida de los detalles del cliente (Dándole click al botón con una imágen de perfil, en la acciones del registro encontrado).

> 3- Eliminar al cliente encontrado (Dándole click al botón con una imágen de papelera, en las acciones del registro encontrado).

> 4- Restaurar al cliente encontrado (Dándole click al botón con una imágen de refrescar, en las acciones del registro encontrado).

> 4- Actualizar al cliente encontrado (Dándole click al botón con un lapiz, en la acciones del registro encontrado).

>5. Agregar pagos, dándole click al botón del lado derecho,  al carrito de super.

>6. Ver los pagos del cliente, dándole click al botón de tarjeta, al lado del botón de agregar pago.

##Consular Cliente
1- Para consultar un cliente, deberá acceder a su cuenta de administrador, y podrá hacer lo siguiente:
2- En la pantalla principal.

> 1- Darle click a "Consultar"

> 2- Llenar los datos en la casilla de búsqueda por CI, y darle click al botón de lupa.

3- En el menú "Cliente", en la barra de navegación superior:

> 1- Darle click a "Consultar"

> 2- Llenar los datos en la casilla de búsqueda por CI, y darle click al botón de lupa.

#Data
##Exportar Data
1- Para exportar la data actual de la base de datos, debe acceder con su cuenta de super-administrador (o rol de exportar data), y podrá:

2- Desde la pantalla principal.

>1- Darle click a Exportar
>2- Esperar a que la exportación esté lista.
>3- Elegir la locación de almacenamiento. Si se abrió una ventana, podrá cerrarla.

3- Desde la pantalla de Exportar Data (Menu : `Administracion` -> `Exportar/Importar`)

>1- Darle click a Generar.
>2- Esperar a que la exportación esté lista.
>3- Elegir la locación de almacenamiento. Si se abrió una ventana, podrá cerrarla.

4- Desde la pantalla de Exportar Data (Menu : `Administracion` -> `Exportar/Importar`)

>1- Darle click al botón de descarga (al lado del botón de papelera), en la lista de respaldos.
>2- Elegir la locación de almacenamiento. Si se abrió una ventana, podrá cerrarla.

##Importar Data
1- Para exportar la data actual de la base de datos, debe acceder con su cuenta de super-administrador (o rol de exportar data), y podrá:

2- Desde la pantalla de Importar Data (Menu : `Administracion` -> `Exportar/Importar`)

>1- Desplegar la pantalla de "Importar Data".
>2- Seleccionar un archivo generado por el procedimiento previo de exportar data.
>3- Darle click a "subir". Una vez subido, la pantalla cambiará, y deberá reiniciar el cliente.

##Eliminar archivos internos de respaldo
Los archivos de respaldo son generados cada vez que exporta data o importa data (como una copia previa a la exportación). Para eliminar archivos no necesarios, podrá hacer lo siguiente:

1- Desde la pantalla Exportar/Importar (Menu : `Administracion` -> `Exportar/Importar`)
> Extender la pantalla de Exportar Data (Dándole al símbolo `+`, del lado derecho).
> Darle click al botón de de papelera.
> Confirmar la eliminación del respaldo.

#Comandos del Servidor
Los comandos del servidor están diseñados para interactuar directamente con el sistema principal que sirve de base para el sistema cliente. Si la data del servidor se corrompe, el cliente no podrá acceder, y las operaciones previas no podrán ser posibles. Por ende, los comandos del servidor sirven de propósito el interactuar con la data de manera directa.

##Exportar Data (export)
El comando para exportar data sirve para generar un archivo de respaldo al directorio (carpeta) especificado como parámetro.
La sintaxis del comando es la siguiente:
`$LOCACION_NODE $LOCACION_INDEX export $LOCACION_EXPORT`
Donde:
> `$LOCACION_NODE` Es la locación del ejecutable nodeJS v9.11.2

>  `$LOCACION_INDEX` Es la locación del archivo index.js, del servidor.

> `$LOCACION_EXPORT` Es la locación del directorio de salida donde se almacenará el archivo .zip.

**Ejemplo** Desde la carpeta principal, el comando sería el siguiente:
`.\bin\node\node-v9.11.2-win-x86\node.exe .\server\dist\index.js export C:\Respaldos`

##Restaurar Data (restore)
El comando para importar data sirve para leer un archivo de respaldo (.zip) y re-emplazar la base de datos de producción actual.
La sintaxis del comando es el siguiente:
`$LOCACION_NODE $LOCACION_INDEX restore $LOCACION_EXPORT`
Donde:
> `$LOCACION_NODE` Es la locación del ejecutable nodeJS v9.11.2

>  `$LOCACION_INDEX` Es la locación del archivo index.js, del servidor.

> `$LOCACION_EXPORT` Es la locación del archivo de respaldo .zip.


**Ejemplo** Desde la carpeta principal, el comando sería el siguiente:
`.\bin\node\node-v9.11.2-win-x86\node.exe .\server\dist\index.js`
`restore C:\Respaldos\2018_02_15_20_30.zip`

##Traducir e Importar Archivos de Texto (parse)
El comando sirve para leer los archivos de texto de un directorio en particular, traducirlos y compararlos con los registros existentes.
La sintaxis del comando es la siguiente:
`$LOCACION_NODE $LOCACION_INDEX parse $LOCACION_EXPORT`
Donde:
> `$LOCACION_NODE` Es la locación del ejecutable nodeJS v9.11.2

>  `$LOCACION_INDEX` Es la locación del archivo index.js, del servidor.

> `$LOCACION_EXPORT` Es la locación de los archivos .txt que poseen los registros.

>`$LOGGING` Grupo  de tres dígitos que denotarán el nivel de log que se quiere almacenar / obtener de la operación de importación de registros. Estará denotado por 3 dígitos consecutivos que podrán ser o 1 o 0, y representarán el nivel de log que se quiere lograr.
> \* El primer dígito  [ (1)00 ]: Generará un log de la creación de nuevos registros.
> \* El segundo dígito [ 0(0)0 ]: Generará un log de la modificación de los registros existentes.
> \* El tercer dígito  [ 00(1) ]: Generará un log de básico del registro obtenido del archivo de texto.

**Ejemplo** Desde la carpeta principal, el comando sería el siguiente:
`.\bin\node\node-v9.11.2-win-x86\node.exe .\server\dist\index.js`
`parse C:\GYM 100`


