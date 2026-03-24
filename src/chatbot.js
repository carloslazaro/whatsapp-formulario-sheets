const{enviarMensaje,enviarLista,enviarBotones}=require('./whatsapp');
const{guardarEnSheets}=require('./sheets');
const S=new Map(),T=30*60*1000;
function g(t,n){if(S.has(t)&&Date.now()-S.get(t).u>T)S.delete(t);if(!S.has(t))S.set(t,{p:'inicio',n,d:{},u:Date.now()});const s=S.get(t);s.u=Date.now();return s;}
async function procesarMensajeEntrante(t,n,x){
const s=g(t,n),l=x.toLowerCase();
if(l==='cancelar'||l==='reiniciar'){S.delete(t);await enviarMensaje(t,'Cancelado. Escribe *hola* para empezar.');return;}
switch(s.p){
case'inicio':await enviarMensaje(t,'Hola'+(n?' '+n:'')+'! Bienvenido.\n\nTe ayudo con tu *solicitud de servicio*.\nEscribe *cancelar* cuando quieras.\n\n*Tu nombre completo?*');s.p='nombre';break;
case'nombre':if(x.length<2){await enviarMensaje(t,'Escribe tu nombre.');return;}s.d.nombre=x;await enviarMensaje(t,'Perfecto *'+x+'*.\n\n*Empresa?* (o "particular")');s.p='empresa';break;
case'empresa':s.d.empresa=x;await enviarMensaje(t,'*Email de contacto?*');s.p='email';break;
case'email':if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)){await enviarMensaje(t,'Email no valido.');return;}s.d.email=x;await enviarLista(t,'*Tipo de servicio?*','Ver',[{id:'w',titulo:'Desarrollo web',descripcion:'Webs, tiendas'},{id:'a',titulo:'App movil',descripcion:'iOS/Android'},{id:'d',titulo:'Diseno',descripcion:'Logos, branding'},{id:'m',titulo:'Marketing',descripcion:'SEO, SEM, RRSS'},{id:'c',titulo:'Consultoria',descripcion:'Asesoria tech'},{id:'au',titulo:'Automatizacion',descripcion:'Flujos, bots'},{id:'o',titulo:'Otro',descripcion:'Otro'}]);s.p='servicio';break;
case'servicio':s.d.servicio=x;await enviarMensaje(t,'*Describe tu proyecto:*');s.p='descripcion';break;
case'descripcion':if(x.length<10){await enviarMensaje(t,'Mas detalle.');return;}s.d.descripcion=x;await enviarLista(t,'*Presupuesto?*','Ver',[{id:'1',titulo:'< 500',descripcion:'Pequeno'},{id:'2',titulo:'500-1500',descripcion:'Mediano'},{id:'3',titulo:'1500-5000',descripcion:'Grande'},{id:'4',titulo:'5000-15000',descripcion:'Enterprise'},{id:'5',titulo:'> 15000',descripcion:'Muy grande'},{id:'6',titulo:'Sin definir',descripcion:'Orientame'}]);s.p='presupuesto';break;
  case'presupuesto':s.d.presupuesto=x;await enviarLista(t,'*Urgencia?*','Ver',[{id:'u',titulo:'Urgente',descripcion:'< 1 semana'},{id:'m',titulo:'1 mes',descripcion:'1 mes'},{id:'t',titulo:'2-3 meses',descripcion:'Con plazo'},{id:'s',titulo:'Sin prisa',descripcion:'Sin fecha'}]);s.p='urgencia';break;
case'urgencia':s.d.urgencia=x;await enviarBotones(t,'*Resumen:*\nNombre:'+s.d.nombre+'\nEmpresa:'+s.d.empresa+'\nEmail:'+s.d.email+'\nServicio:'+s.d.servicio+'\nDesc:'+s.d.descripcion+'\nPresupuesto:'+s.d.presupuesto+'\nUrgencia:'+s.d.urgencia+'\n\nOK?',[{id:'ok',titulo:'Confirmar'},{id:'no',titulo:'Cancelar'}]);s.p='conf';break;
  case'conf':if(l.includes('confirmar')||l==='si'){try{await guardarEnSheets({fecha:new Date().toLocaleString('es-ES',{timeZone:'Europe/Madrid'}),telefono:t,nombreWhatsapp:s.n,...s.d});await enviarMensaje(t,'*Enviado!* Contactaremos contigo. Gracias!');}catch(e){console.error(e);await enviarMensaje(t,'Error. Intentalo luego.');}S.delete(t);}else if(l.includes('cancelar')){S.delete(t);await enviarMensaje(t,'Cancelado.');}else{await enviarBotones(t,'Confirma o cancela:',[{id:'ok',titulo:'Confirmar'},{id:'no',titulo:'Cancelar'}]);}break;
default:S.delete(t);await enviarMensaje(t,'Error. Escribe *hola*.');}}
module.exports={procesarMensajeEntrante};
