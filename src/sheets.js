const { google } = require('googleapis');
const path = require('path');
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Solicitudes';
const CREDS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || './credentials/google-service-account.json';
const CABECERAS = ['Fecha','Telefono','Nombre WhatsApp','Nombre completo','Empresa','Email','Tipo de servicio','Descripcion del proyecto','Presupuesto','Urgencia'];

async function getSheets() {
  const auth = new google.auth.GoogleAuth({ keyFile: path.resolve(CREDS_PATH), scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    return google.sheets({ version: 'v4', auth: await auth.getClient() });
    }

    async function initCabeceras(sheets) {
      try {
          const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: SHEET_NAME + '!A1:J1' });
              if (!r.data.values || !r.data.values.length) {
                    await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID, range: SHEET_NAME + '!A1:J1', valueInputOption: 'RAW', requestBody: { values: [CABECERAS] } });
                        }
                          } catch (e) {
                              if (e.code === 400 || (e.message && e.message.includes('Unable to parse range'))) {
                                    await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] } });
                                          await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID, range: SHEET_NAME + '!A1:J1', valueInputOption: 'RAW', requestBody: { values: [CABECERAS] } });
                                              } else { throw e; }
                                                }
                                                }

                                                async function guardarEnSheets(datos) {
                                                  const sheets = await getSheets();
                                                    await initCabeceras(sheets);
                                                      const fila = [datos.fecha||'',datos.telefono||'',datos.nombreWhatsapp||'',datos.nombre||'',datos.empresa||'',datos.email||'',datos.servicio||'',datos.descripcion||'',datos.presupuesto||'',datos.urgencia||''];
                                                        await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range: SHEET_NAME + '!A:J', valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', requestBody: { values: [fila] } });
                                                          console.log('Datos guardados para: ' + datos.nombre);
                                                          }

                                                          module.exports = { guardarEnSheets };
