# Guia de configuracion: WhatsApp Formulario -> Google Sheets

## Arquitectura

Cliente WhatsApp -> Meta Cloud API -> Tu servidor (webhook) -> Google Sheets API -> Spreadsheet

El chatbot hace las preguntas una a una dentro de WhatsApp (con listas y botones interactivos), y al confirmar, guarda todo en Google Sheets.

---

## PASO 1: Configurar WhatsApp Cloud API (Gratis)

### 1.1 Crear app en Meta for Developers

1. Ve a developers.facebook.com e inicia sesion.
2. Haz clic en "Mis apps" > "Crear app".
3. Selecciona "Otro" como tipo de app y luego "Business".
4. Ponle un nombre (ej: "Formulario WhatsApp") y crea la app.

### 1.2 Anadir WhatsApp a la app

1. En el panel de tu app, busca "WhatsApp" y haz clic en "Configurar".
2. Meta te asigna un numero de prueba y un token temporal. Apuntalos.
3. Desde aqui puedes enviar mensajes de prueba a tu propio numero.

### 1.3 Obtener credenciales

En la seccion de WhatsApp de tu app encontraras:
- Token de acceso temporal: Usalo para pruebas (expira en 24h).
- Phone Number ID: Identifica tu numero de WhatsApp Business.

Para produccion necesitaras un token permanente:
1. Ve a Configuracion de la app > Basica > copia el App Secret.
2. En Tokens de acceso del sistema, crea un usuario del sistema con permisos de WhatsApp.
3. Genera un token permanente para ese usuario.

### 1.4 Configurar el webhook

1. Despliega primero el servidor (ver Paso 3).
2. En la seccion de WhatsApp de tu app, ve a "Configuracion" > "Webhook".
3. URL del webhook: https://tu-dominio.com/webhook
4. Token de verificacion: el mismo valor que pusiste en WEBHOOK_VERIFY_TOKEN en tu .env.
5. Suscribete al campo "messages".

---

## PASO 2: Configurar Google Sheets API

### 2.1 Crear una cuenta de servicio en Google Cloud

1. Ve a console.cloud.google.com.
2. Crea un proyecto nuevo (o usa uno existente).
3. Ve a "APIs y servicios" > "Biblioteca".
4. Busca "Google Sheets API" y activala.
5. Ve a "APIs y servicios" > "Credenciales".
6. Haz clic en "Crear credenciales" > "Cuenta de servicio".
7. Ponle un nombre (ej: "whatsapp-formulario").
8. Una vez creada, haz clic en la cuenta > pestana "Claves" > "Agregar clave" > "Crear clave nueva" > JSON.
9. Se descargara un archivo .json. Renombralo a google-service-account.json.
10. Copia ese archivo a la carpeta credentials/ del proyecto.

### 2.2 Crear la hoja de calculo

1. Ve a Google Sheets y crea una hoja nueva.
2. Copia el ID de la URL: https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
3. Importante: Comparte la hoja con el email de la cuenta de servicio (campo client_email del JSON). Dale permisos de Editor.

### 2.3 Configurar las variables

En tu archivo .env:
- GOOGLE_SHEET_ID=el_id_que_copiaste
- GOOGLE_SHEET_NAME=Solicitudes
- GOOGLE_CREDENTIALS_PATH=./credentials/google-service-account.json

El bot creara automaticamente la pestana "Solicitudes" y las cabeceras la primera vez.

---

## PASO 3: Desplegar el servidor

### Opcion A: Railway (Recomendada)

1. Sube el proyecto a GitHub.
2. Ve a railway.app y conecta tu cuenta de GitHub.
3. Crea un nuevo proyecto y selecciona tu repositorio.
4. En Variables, anade todas las del .env.
5. Railway te dara una URL publica tipo https://tu-app.railway.app.
6. Usa esa URL + /webhook en la configuracion de Meta.

### Opcion B: VPS propio

Clona el repo, ejecuta npm install, configura .env, copia credenciales de Google a ./credentials/, e inicia con PM2.

---

## PASO 4: Probar el sistema

1. En Meta for Developers, anade tu numero personal como numero de prueba.
2. Envia "hola" al numero de WhatsApp Business de prueba.
3. El bot deberia responderte con el formulario paso a paso.
4. Al confirmar, revisa tu Google Sheets.

---

## Personalizacion

Edita src/chatbot.js para cambiar preguntas. Edita las opciones de enviarLista() para cambiar servicios, presupuestos y urgencias. En src/sheets.js anade nuevas columnas a CABECERAS y al array fila.
