/**
 * SERVIDOR PRINCIPAL
  * Recibe mensajes de WhatsApp via webhook y gestiona el flujo del formulario.
   */
   require('dotenv').config();
   const express = require('express');
   const { procesarMensajeEntrante } = require('./chatbot');

   const app = express();
   app.use(express.json());

   const PORT = process.env.PORT || 3000;
   const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

   // GET /webhook - Verificacion del webhook (Meta lo llama al configurar)
   app.get('/webhook', (req, res) => {
     const mode = req.query['hub.mode'];
       const token = req.query['hub.verify_token'];
         const challenge = req.query['hub.challenge'];

           if (mode === 'subscribe' && token === VERIFY_TOKEN) {
               console.log('Webhook verificado correctamente');
                   return res.status(200).send(challenge);
                     }

                       console.warn('Verificacion fallida: token incorrecto');
                         return res.sendStatus(403);
                         });

                         // POST /webhook - Recepcion de mensajes entrantes
                         app.post('/webhook', async (req, res) => {
                           try {
                               const body = req.body;

                                   if (body.object !== 'whatsapp_business_account') {
                                         return res.sendStatus(404);
                                             }

                                                 const entry = body.entry?.[0];
                                                     const changes = entry?.changes?.[0];
                                                         const value = changes?.value;

                                                             if (value?.messages && value.messages.length > 0) {
                                                                   const mensaje = value.messages[0];
                                                                         const telefono = mensaje.from;
                                                                               const nombreContacto = value.contacts?.[0]?.profile?.name || 'Sin nombre';

                                                                                     let texto = null;

                                                                                           if (mensaje.type === 'text') {
                                                                                                   texto = mensaje.text.body.trim();
                                                                                                         } else if (mensaje.type === 'interactive') {
                                                                                                                 if (mensaje.interactive.type === 'button_reply') {
                                                                                                                           texto = mensaje.interactive.button_reply.title;
                                                                                                                                   } else if (mensaje.interactive.type === 'list_reply') {
                                                                                                                                             texto = mensaje.interactive.list_reply.title;
                                                                                                                                                     }
                                                                                                                                                           } else if (mensaje.type === 'button') {
                                                                                                                                                                   texto = mensaje.button.text;
                                                                                                                                                                         }
                                                                                                                                                                         
                                                                                                                                                                               if (texto) {
                                                                                                                                                                                       console.log(`Mensaje de ${nombreContacto} (${telefono}): ${texto}`);
                                                                                                                                                                                               await procesarMensajeEntrante(telefono, nombreContacto, texto);
                                                                                                                                                                                                     } else {
                                                                                                                                                                                                             const { enviarMensaje } = require('./whatsapp');
                                                                                                                                                                                                                     await enviarMensaje(telefono, 'Por favor, responde con un mensaje de texto.');
                                                                                                                                                                                                                           }
                                                                                                                                                                                                                               }
                                                                                                                                                                                                                               
                                                                                                                                                                                                                                   return res.sendStatus(200);
                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                     } catch (error) {
                                                                                                                                                                                                                                         console.error('Error procesando webhook:', error);
                                                                                                                                                                                                                                             return res.sendStatus(200);
                                                                                                                                                                                                                                               }
                                                                                                                                                                                                                                               });
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                               app.get('/health', (req, res) => {
                                                                                                                                                                                                                                                 res.json({ status: 'ok', timestamp: new Date().toISOString() });
                                                                                                                                                                                                                                                 });
                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                 app.listen(PORT, () => {
                                                                                                                                                                                                                                                   console.log(`Servidor corriendo en puerto ${PORT}`);
                                                                                                                                                                                                                                                     console.log(`Webhook disponible en /webhook`);
                                                                                                                                                                                                                                                     });
