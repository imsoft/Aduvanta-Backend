# Plantilla — Notificación a titulares por incidente de seguridad

> **Completar dentro de las 72 h posteriores al descubrimiento del incidente.**
> **Enviar por email a cada titular afectado y, si la brecha es masiva, publicar en el sitio.**

---

Asunto: [Aduvanta] Notificación de incidente de seguridad

Estimado(a) [NOMBRE DEL TITULAR]:

En Aduvanta tomamos con la máxima seriedad la protección de tus datos personales. Escribimos para informarte sobre un incidente de seguridad que **pudo haber afectado tus datos** y explicar las medidas que estamos tomando.

## ¿Qué ocurrió?

El día **[FECHA Y HORA DE DETECCIÓN]** detectamos [DESCRIPCIÓN BREVE DEL INCIDENTE, p. ej. "un acceso no autorizado al sistema de archivos donde almacenamos documentos operativos"]. El incidente fue contenido el **[FECHA Y HORA DE CONTENCIÓN]**.

## ¿Qué datos se vieron involucrados?

Los datos que **pudieron** haber sido accedidos son:

- [LISTA CONCRETA: "nombre completo", "correo electrónico", "RFC", "copias de facturas o pedimentos", etc.]

**No** se vieron comprometidos: contraseñas (están cifradas con bcrypt y nunca se almacenan en claro), números de tarjeta (procesados por Stripe y nunca tocan nuestros servidores).

## ¿Qué estamos haciendo?

1. Contuvimos el incidente y eliminamos el vector de ataque.
2. Rotamos las credenciales comprometidas.
3. Iniciamos una auditoría forense con [EMPRESA / INTERNO].
4. Notificamos al INAI el **[FECHA]** según lo previsto en la LFPDPPP.
5. [OTRAS ACCIONES: p. ej. "implementamos MFA obligatorio en el dashboard", "reforzamos el cifrado de documentos en S3"].

## ¿Qué puedes hacer?

- **Cambia tu contraseña de Aduvanta** en [URL].
- Si reutilizas esa contraseña en otros servicios, **cámbiala también en ellos**.
- Activa la autenticación de dos factores (MFA) cuando esté disponible.
- Si notas actividad sospechosa en tu cuenta, contáctanos de inmediato.

## Derechos ARCO y contacto

Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales. Para ejercer estos derechos o resolver dudas sobre este incidente:

- Correo: **[EMAIL DE CONTACTO ARCO]**
- Teléfono: **[TELÉFONO]**
- Horario de atención: **[HORARIO]**

## Compromiso

Lamentamos profundamente este incidente y estamos comprometidos a mantenerte informado sobre cualquier desarrollo relevante. Continuaremos reforzando nuestras medidas de seguridad para prevenir que vuelva a ocurrir.

Atentamente,

**[NOMBRE]**
[CARGO]
Aduvanta
[FECHA]

---

### Checklist interno (no enviar al titular)

- [ ] Aviso INAI presentado (si hay afectación significativa).
- [ ] Aviso a autoridad de control UE (si hay usuarios en UE y alto riesgo).
- [ ] Post-mortem en `docs/incidents/YYYY-MM-DD-<slug>.md`.
- [ ] Lista de titulares afectados exportada y archivada.
- [ ] Secretos rotados según matriz de `security-operations.md`.
- [ ] Aviso publicado en homepage si el volumen lo justifica.
- [ ] Comunicado a equipo interno.
