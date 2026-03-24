/**
 * MODULO DE WHATSAPP
 * Funciones para enviar mensajes a traves de la API de WhatsApp Cloud.
 */
const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_URL = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

async function enviarMensaje(telefono, texto) {
    try {
          await axios.post(API_URL, {
                  messaging_product: 'whatsapp',
                  to: telefono,
                  type: 'text',
                  text: { body: texto }
          }, {
                  headers: {
                            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                            'Content-Type': 'application/json'
                  }
          });
    } catch (error) {
          console.error('Error enviando mensaje de WhatsApp:', error.response?.data || error.message);
          throw error;
    }
}

async function enviarBotones(telefono, textoEncabezado, botones) {
    try {
          await axios.post(API_URL, {
                  messaging_product: 'whatsapp',
                  to: telefono,
                  type: 'interactive',
                  interactive: {
                            type: 'button',
                            body: { text: textoEncabezado },
                            action: {
                                        buttons: botones.map(b => ({
                                                      type: 'reply',
                                                      reply: { id: b.id, title: b.titulo }
                                        }))
                            }
                  }
          }, {
                  headers: {
                            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                            'Content-Type': 'application/json'
                  }
          });
    } catch (error) {
          console.error('Error enviando botones:', error.response?.data || error.message);
          throw error;
    }
}

async function enviarLista(telefono, textoEncabezado, textoBoton, opciones) {
    try {
          await axios.post(API_URL, {
                  messaging_product: 'whatsapp',
                  to: telefono,
                  type: 'interactive',
                  interactive: {
                            type: 'list',
                            body: { text: textoEncabezado },
                            action: {
                                        button: textoBoton,
                                        sections: [{
                                                      title: 'Opciones',
                                                      rows: opciones.map(o => ({
                                                                      id: o.id,
                                                                      title: o.titulo,
                                                                      description: o.descripcion || ''
                                                      }))
                                        }]
                            }
                  }
          }, {
                  headers: {
                            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                            'Content-Type': 'application/json'
                  }
          });
    } catch (error) {
          console.error('Error enviando lista:', error.response?.data || error.message);
          throw error;
    }
}

module.exports = { enviarMensaje, enviarBotones, enviarLista };
