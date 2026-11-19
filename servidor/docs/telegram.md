# Telegram: vínculo y entrega

## Flujo

```mermaid
flowchart TD
    A[Usuario crea enlace temporal] --> B[Contacto abre el enlace y pulsa Start]
    B --> C[Worker guarda su chat real]
    C --> D[Worker toma destinatarios pending]
    D --> E{Telegram responde bien?}
    E -- Sí --> F[Marcar sent]
    E -- No temporal --> G[Reintentar hasta tres veces]
    E -- No definitivo --> H[Marcar failed]
```

## Reglas

- El enlace de vinculación expira en una hora y solo se puede usar una vez.
- El token del bot se lee únicamente desde `TELEGRAM_BOT_TOKEN`; nunca llega al navegador.
- Cada destinatario se reserva antes de enviar, evitando duplicados entre workers.
- Los errores temporales se reintentan tres veces; los definitivos se registran como fallidos.
