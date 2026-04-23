import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { AppConfigService } from '../../config/config.service.js';

/**
 * Transactional email sender backed by Resend. If `RESEND_API_KEY` is not
 * configured the service logs instead of sending so local dev and previews
 * don't need a real API key. Production should always set the key.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor(private readonly config: AppConfigService) {
    const apiKey = this.config.get('RESEND_API_KEY');
    this.from = this.config.get('EMAIL_FROM');
    this.client = apiKey ? new Resend(apiKey) : null;

    if (!this.client) {
      this.logger.warn(
        'RESEND_API_KEY is not set. Transactional emails will be logged instead of sent.',
      );
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async send(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this.client) {
      this.logger.log(
        { to: params.to, subject: params.subject },
        '[email:dev] would send email (Resend not configured)',
      );
      return;
    }

    try {
      const { error } = await this.client.emails.send({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text ?? stripHtml(params.html),
      });

      if (error) {
        this.logger.error({ error, to: params.to }, 'Failed to send email');
        throw new Error(`Email delivery failed: ${error.message}`);
      }
    } catch (err) {
      this.logger.error({ err, to: params.to }, 'Failed to send email');
      throw err;
    }
  }

  async sendPasswordReset(params: {
    to: string;
    userName: string;
    resetUrl: string;
  }): Promise<void> {
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="margin:0 0 16px;font-size:20px">Restablecer contraseña</h1>
        <p>Hola ${escapeHtml(params.userName)},</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Aduvanta.</p>
        <p>
          <a href="${params.resetUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">
            Restablecer contraseña
          </a>
        </p>
        <p style="color:#64748b;font-size:14px">Si no fuiste tú, puedes ignorar este correo. El enlace caducará en 1 hora.</p>
      </div>
    `;
    await this.send({
      to: params.to,
      subject: 'Restablece tu contraseña de Aduvanta',
      html,
    });
  }

  async sendVerification(params: {
    to: string;
    userName: string;
    verifyUrl: string;
  }): Promise<void> {
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="margin:0 0 16px;font-size:20px">Verifica tu correo</h1>
        <p>Hola ${escapeHtml(params.userName)}, bienvenido a Aduvanta.</p>
        <p>Para activar tu cuenta, verifica tu correo electrónico:</p>
        <p>
          <a href="${params.verifyUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">
            Verificar correo
          </a>
        </p>
        <p style="color:#64748b;font-size:14px">Si no creaste esta cuenta, ignora este correo.</p>
      </div>
    `;
    await this.send({
      to: params.to,
      subject: 'Verifica tu correo en Aduvanta',
      html,
    });
  }
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
