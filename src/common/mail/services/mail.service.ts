
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import { CabinetService } from 'src/modules/cabinet/services/cabinet.service';
import * as mime from 'mime-types';

@Injectable()
export class MailService {

  private transporter: Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly cabinetService: CabinetService,
    private readonly pdfService: PdfService,

  ) {


    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // ou smtp.mailtrap.io
      port: 587, // pour Gmail, 587 (TLS) ou 465 (SSL)
      secure: false, // true si port 465
      auth: {
        user: this.configService.get('app.zc_email'),
        pass: this.configService.get('app.zc_email_password'),
      },
    });
  }
async sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `http://localhost:3001/reset-password?token=${token}`;

  let imageBase64: string | undefined = undefined;
  let extension: string | undefined;
  let relativePath: string | undefined;

  const cabinet = await this.cabinetService.findOneById(1);
 if (cabinet.logo) {
  const mimetype = cabinet.logo.mimetype;
  extension = mime.extension(mimetype) || '';
  relativePath = cabinet.logo.slug;
  if (extension) {
    relativePath = `${cabinet.logo.slug}.${extension}`;
  }
  const fullPath = `${this.pdfService.rootLocation}/${relativePath}`;
  const base64 = await this.pdfService.imageToBase64(fullPath); // doit retourner juste les données

  imageBase64 = `data:${mimetype};base64,${base64}`;
}

  const logoHtml = imageBase64
    ? `<div id="logo"><img src="${imageBase64}" alt="logo" style="max-height: 100px;" /></div>`
    : '';

  const html = `
    <h1>Réinitialisation du mot de passe</h1>
        ${logoHtml}

    <p>Clique sur le bouton ci-dessous pour réinitialiser ton mot de passe :</p>
    <a href="${resetUrl}" style="padding:10px 20px;background-color:blue;color:white;text-decoration:none;">Réinitialiser</a>
  `;

  await this.transporter.sendMail({
    from: this.configService.get('app.zc_email'),
    to,
    subject: 'Réinitialisation du mot de passe',
    html,
  });
}
}
