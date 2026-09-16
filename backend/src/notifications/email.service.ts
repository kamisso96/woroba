import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private fromAddress = 'Woroba <onboarding@resend.dev>';
  private testOverride: string | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY manquant - les emails ne seront pas envoyes',
      );
    }

    // Override de test : force tous les emails vers cette adresse
    const override = this.configService.get<string>('RESEND_TEST_OVERRIDE');
    if (override) {
      this.testOverride = override;
      this.logger.warn(`Mode TEST Resend actif - tous les emails vont a ${override}`);
    }
  }

  async send(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn(`Email non envoye (pas de cle): ${subject} -> ${to}`);
      return false;
    }

    const finalTo = this.testOverride ?? to;

    try {
      const result = await this.resend.emails.send({
        from: this.fromAddress,
        to: finalTo,
        subject,
        html,
      });

      if (result.error) {
        this.logger.error(
          `Echec envoi a ${finalTo}: ${result.error.message}`,
        );
        return false;
      }

      this.logger.log(`Email envoye a ${finalTo} (id: ${result.data?.id})`);
      return true;
    } catch (err) {
      this.logger.error(`Erreur envoi email a ${finalTo}:`, err);
      return false;
    }
  }
}