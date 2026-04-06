import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Envía un email usando la API REST de Brevo (antes Sendinblue)
 * Usa HTTPS (puerto 443), evita problemas de SMTP/IPv6 en Render
 */
const enviarEmailBrevo = async (destinatario, asunto, htmlContent) => {
  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "Numerología ✨",
        email: process.env.EMAIL_USER,
      },
      to: [{ email: destinatario }],
      subject: asunto,
      htmlContent: htmlContent,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  return response;
};

/**
 * Envía email de bienvenida al nuevo usuario registrado
 */
export const enviarEmailBienvenida = async (nombre, email) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0c29;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.05); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <h1 style="color: #e0c3fc; font-size: 32px; margin: 0; letter-spacing: 2px;">✨ Numerología ✨</h1>
                  </td>
                </tr>

                <!-- Contenido principal -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px;">¡Hola, ${nombre}! 👋</h2>
                    <p style="color: #c9b8e8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Tu registro ha sido <strong style="color: #a8edea;">exitoso</strong>. Estamos emocionados de tenerte en nuestra comunidad de numerología.
                    </p>
                  </td>
                </tr>

                <!-- Qué puedes hacer -->
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="color: #e0c3fc; font-size: 18px; margin: 0 0 16px;">🔮 ¿Qué puedes hacer?</h3>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0; color: #c9b8e8; font-size: 15px;">⭐ Obtener tu lectura numerológica personalizada</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #c9b8e8; font-size: 15px;">📊 Descubrir el significado de tus números</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #c9b8e8; font-size: 15px;">🌟 Acceder a lecturas diarias con tu membresía premium</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Botón CTA -->
                <tr>
                  <td style="padding: 10px 40px 30px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; letter-spacing: 1px;">
                      Ir a la plataforma →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
                    <p style="color: #8b7fa8; font-size: 13px; margin: 0;">
                      Este email fue enviado porque te registraste en Numerología.<br>
                      © ${new Date().getFullYear()} Numerología. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await enviarEmailBrevo(email, "¡Bienvenido a Numerología! ✨", html);
    console.log(`✅ Email de bienvenida enviado a ${email}`);
  } catch (error) {
    console.error("❌ Error al enviar email de bienvenida:", error.response?.data || error.message);
    // No lanzamos error para no afectar el registro
  }
};

/**
 * Envía email de recordatorio diario para generar lectura
 */
export const enviarEmailRecordatorio = async (nombre, email) => {
  try {
    const hoy = new Date().toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0c29;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.05); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 10px; text-align: center;">
                    <h1 style="color: #e0c3fc; font-size: 28px; margin: 0;">🌅 Buenos días</h1>
                  </td>
                </tr>

                <!-- Contenido -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 12px;">¡Hola, ${nombre}! ✨</h2>
                    <p style="color: #c9b8e8; font-size: 16px; line-height: 1.6; margin: 0 0 10px;">
                      Hoy es <strong style="color: #a8edea;">${hoy}</strong> y tu lectura numerológica del día ya está disponible.
                    </p>
                    <p style="color: #c9b8e8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Descubre qué tienen los números preparado para ti hoy. ¡No dejes pasar la oportunidad de conocer tu energía del día!
                    </p>
                  </td>
                </tr>

                <!-- Botón CTA -->
                <tr>
                  <td style="padding: 10px 40px 30px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL}" 
                       style="display: inline-block; background: linear-gradient(135deg, #f093fb, #f5576c); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; letter-spacing: 1px;">
                      Ver mi lectura del día 🔮
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
                    <p style="color: #8b7fa8; font-size: 13px; margin: 0;">
                      Recibes este email porque eres miembro premium de Numerología.<br>
                      © ${new Date().getFullYear()} Numerología. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await enviarEmailBrevo(email, "🌅 Tu lectura numerológica del día te espera", html);
    console.log(`✅ Recordatorio enviado a ${email}`);
  } catch (error) {
    console.error(`❌ Error al enviar recordatorio a ${email}:`, error.response?.data || error.message);
  }
};

/**
 * Envía email cuando la membresía ha vencido
 */
export const enviarEmailMembresiaVencida = async (nombre, email) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0c29;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.05); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 10px; text-align: center;">
                    <h1 style="color: #ff9a9e; font-size: 28px; margin: 0;">⌛ Membresía Vencida</h1>
                  </td>
                </tr>

                <!-- Contenido -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 12px;">¡Hola, ${nombre}! 👋</h2>
                    <p style="color: #c9b8e8; font-size: 16px; line-height: 1.6; margin: 0 0 10px;">
                      Te informamos que tu membresía premium en Numerología ha <strong style="color: #ff9a9e;">vencido</strong>.
                    </p>
                    <p style="color: #c9b8e8; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Para seguir accediendo a tus lecturas diarias personalizadas y descubrir qué tienen los números para ti, te invitamos a renovar tu suscripción.
                    </p>
                  </td>
                </tr>

                <!-- Botón CTA -->
                <tr>
                  <td style="padding: 10px 40px 30px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL}" 
                       style="display: inline-block; background: linear-gradient(135deg, #fbc2eb, #a6c1ee); color: #1a1a2e; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; letter-spacing: 1px;">
                      Renovar mi membresía 🔮
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
                    <p style="color: #8b7fa8; font-size: 13px; margin: 0;">
                      Si crees que esto es un error, por favor contáctanos.<br>
                      © ${new Date().getFullYear()} Numerología. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await enviarEmailBrevo(email, "⌛ Tu membresía de Numerología ha vencido", html);
    console.log(`✅ Email de vencimiento enviado a ${email}`);
  } catch (error) {
    console.error(`❌ Error al enviar email de vencimiento a ${email}:`, error.response?.data || error.message);
  }
};
