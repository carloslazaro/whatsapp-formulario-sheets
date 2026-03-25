/**
 * MÓDULO DE GOOGLE SHEETS
 * Se conecta a Google Sheets mediante una cuenta de servicio
 * y añade filas con los datos del formulario.
 */
const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Solicitudes';

// Cabeceras de la hoja (deben coincidir con la primera fila del spreadsheet)
const CABECERAS = [
    'Fecha',
    'Teléfono',
    'Nombre WhatsApp',
    'Nombre completo',
    'Empresa',
    'Email',
    'Tipo de servicio',
    'Descripción del proyecto',
    'Presupuesto',
    'Urgencia'
  ];

/**
 * Obtiene un cliente autenticado de Google Sheets.
 * Soporta dos modos:
 * 1. GOOGLE_CREDENTIALS: JSON string con las credenciales (recomendado para Railway/cloud)
 * 2. GOOGLE_CREDENTIALS_PATH: ruta al archivo JSON (para desarrollo local)
 */
async function obtenerClienteSheets() {
    let auth;

  if (process.env.GOOGLE_CREDENTIALS) {
        // Modo cloud: credenciales como JSON string en variable de entorno
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
  } else {
        // Modo local: credenciales desde archivo
      const credentialsPath = path.resolve(
              process.env.GOOGLE_CREDENTIALS_PATH || './credentials/google-service-account.json'
            );
        auth = new google.auth.GoogleAuth({
                keyFile: credentialsPath,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
  }

  const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
}

/**
 * Inicializa la hoja con las cabeceras si está vacía.
 */
async function inicializarCabeceras(sheets) {
    try {
          const response = await sheets.spreadsheets.values.get({
                  spreadsheetId: SHEET_ID,
                  range: `${SHEET_NAME}!A1:J1`
          });

      // Si no hay datos en la primera fila, escribir cabeceras
      if (!response.data.values || response.data.values.length === 0) {
              await sheets.spreadsheets.values.update({
                        spreadsheetId: SHEET_ID,
                        range: `${SHEET_NAME}!A1:J1`,
                        valueInputOption: 'RAW',
                        requestBody: {
                                    values: [CABECERAS]
                        }
              });
              console.log('Cabeceras inicializadas en Google Sheets');
      }
    } catch (error) {
          // Si la pestaña no existe, la creamos
      if (error.code === 400 || error.message?.includes('Unable to parse range')) {
              console.log(`Creando pestana "${SHEET_NAME}"...`);
              await sheets.spreadsheets.batchUpdate({
                        spreadsheetId: SHEET_ID,
                        requestBody: {
                                    requests: [{
                                                  addSheet: {
                                                                  properties: { title: SHEET_NAME }
                                                  }
                                    }]
                        }
              });
              // Reintentar escribir cabeceras
            await sheets.spreadsheets.values.update({
                      spreadsheetId: SHEET_ID,
                      range: `${SHEET_NAME}!A1:J1`,
                      valueInputOption: 'RAW',
                      requestBody: {
                                  values: [CABECERAS]
                      }
            });
              console.log('Pestana y cabeceras creadas correctamente');
      } else {
              throw error;
      }
    }
}

/**
 * Guarda los datos del formulario como una nueva fila en Google Sheets.
 * @param {Object} datos - Datos del formulario recogidos por el chatbot
 */
async function guardarEnSheets(datos) {
    const sheets = await obtenerClienteSheets();

  // Asegurar que las cabeceras existen
  await inicializarCabeceras(sheets);

  // Preparar la fila con los datos en el orden correcto
  const fila = [
        datos.fecha || new Date().toLocaleString('es-ES'),
        datos.telefono || '',
        datos.nombreWhatsapp || '',
        datos.nombre || '',
        datos.empresa || '',
        datos.email || '',
        datos.servicio || '',
        datos.descripcion || '',
        datos.presupuesto || '',
        datos.urgencia || ''
      ];

  // Añadir la fila al final de la hoja
  await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:J`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
                values: [fila]
        }
  });

  console.log(`Datos guardados en Google Sheets para: ${datos.nombre} (${datos.telefono})`);
}

module.exports = { guardarEnSheets };
