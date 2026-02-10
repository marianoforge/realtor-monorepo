# 🤖 Chatbot con N8N

## ✅ Integración Completa

El chatbot ya está integrado en tu aplicación. Solo necesitas configurar el webhook de n8n.

## 🚀 Inicio Rápido

### 1. Configura el Webhook en N8N

1. Abre tu workflow: https://marianortp.app.n8n.cloud/workflow/NvXd7vRRvdH5OXSb
2. Agrega un nodo **Webhook** al inicio si no lo tienes
3. Configura el webhook con:
   - **Method**: POST
   - **Response Mode**: Responder inmediatamente
4. Copia la URL del webhook (algo como: `https://marianortp.app.n8n.cloud/webhook/abc123`)

### 2. Configura la Variable de Entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
N8N_WEBHOOK_URL=https://marianortp.app.n8n.cloud/webhook/TU_WEBHOOK_ID
```

### 3. Formato de Respuesta de N8N

Tu workflow debe devolver una respuesta JSON con uno de estos formatos:

```json
{
  "reply": "Tu respuesta aquí"
}
```

O:

```json
{
  "response": "Tu respuesta aquí"
}
```

O:

```json
{
  "message": "Tu respuesta aquí"
}
```

### 4. Prueba el Webhook

Prueba que tu webhook funciona con cURL:

```bash
curl -X POST https://marianortp.app.n8n.cloud/webhook/TU_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "timestamp": "2025-09-29T10:00:00.000Z"}'
```

Deberías recibir algo como: `{"reply": "¡Hola! ¿En qué puedo ayudarte?"}`

### 5. Inicia tu Aplicación

```bash
npm run dev
# o
yarn dev
```

### 6. ¡Listo! 🎉

El chatbot aparecerá como un botón flotante en la esquina inferior derecha cuando inicies sesión.

## 📖 Documentación Completa

Para más detalles, consulta: [docs/CHATBOT_N8N_SETUP.md](../../docs/CHATBOT_N8N_SETUP.md)

## 🎨 Archivos Creados/Modificados

- ✅ `modules/chatbot/N8nChatbot.tsx` - Componente del chatbot
- ✅ `pages/api/chatbot.ts` - Endpoint API que conecta con n8n
- ✅ `components/PrivateComponente/PrivateLayout.tsx` - Integración en layout
- ✅ `docs/CHATBOT_N8N_SETUP.md` - Documentación completa

## 🐛 Problemas?

Si el chatbot no responde:

1. Verifica que `N8N_WEBHOOK_URL` esté en `.env.local`
2. Asegúrate de que tu workflow en n8n esté **activado**
3. Prueba el webhook directamente con cURL
4. Revisa los logs de la consola del navegador (F12)
5. Revisa los logs del servidor Next.js

## 💡 Ejemplo de Workflow N8N Básico

1. **Webhook** - Recibe el mensaje del usuario
2. **HTTP Request** - Llama a una IA (OpenAI, Anthropic, etc.)
3. **Set** - Formatea la respuesta:
   ```javascript
   return [
     {
       json: {
         reply: items[0].json.ai_response,
       },
     },
   ];
   ```
4. **Respond to Webhook** - Devuelve la respuesta al frontend
