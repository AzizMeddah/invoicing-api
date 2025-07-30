import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { join } from 'path';
import { promises as fs } from 'fs';
import { ConfigService } from '@nestjs/config';
import * as mime from 'mime-types';

@Injectable()
export class PdfService {
  constructor(
    private configService: ConfigService,
  ) { }
  rootLocation = this.configService.get('app.uploadPath', { infer: '/upload' });

  async generatePdf(data: any, templateName: string): Promise<Buffer> {
    const templatePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'assets',
      'templates',
      `${templateName}.ejs`,
    );
    const template = await fs.readFile(templatePath, 'utf8');
    /*
        const imagePath = join(
          __dirname,
          '..',
          '..',
          '..',
          'assets',
          'images',
          'logo.png',
        );
        const imageBase64 = await this.imageToBase64(imagePath);*/
    let mimetype 
    let extension 
    let relativePath 

    let imageBase64=undefined
    let signatureBase64=undefined

    if(data.meta.logo){

      mimetype = data.meta.logo.mimetype;
    extension = mime.extension(mimetype) || '';
     relativePath = data.meta.logo.slug;
        if (extension) {
      relativePath = `${data.meta.logo.slug}.${extension}`;
    }
    imageBase64 = await this.imageToBase64(this.rootLocation + '/' + relativePath)
    }
    if(data.meta.signature){

          mimetype = data.meta.signature.mimetype;
    extension = mime.extension(mimetype) || '';
    relativePath = data.meta.signature.slug;

    if (extension) {
      relativePath = `${data.meta.signature.slug}.${extension}`;
    }
    signatureBase64 = await this.imageToBase64(this.rootLocation + '/' + relativePath)
    }

 



    const html = ejs.render(template, { ...data, logo: imageBase64, signature: signatureBase64 });
    const browser = await puppeteer.launch({
      ignoreDefaultArgs: ['--disable-extensions'],
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const stylesheets = await this.getStylesheets(html);
    for (const stylesheet of stylesheets) {
      await page.addStyleTag({
        path: join(__dirname, '..', '..', '..', 'assets', 'css', stylesheet),
      });
    }
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    return pdfBuffer;
  }

  async getStylesheets(html: string): Promise<string[]> {
    const $ = cheerio.load(html);
    const stylesheets: string[] = [];
    $('link[rel="stylesheet"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (
        href &&
        !href.startsWith('http') &&
        !href.startsWith('https') &&
        !href.startsWith('//')
      ) {
        stylesheets.push(href);
      }
    });
    return stylesheets;
  }

  async imageToBase64(imagePath: string): Promise<string> {
    const imageBuffer = await fs.readFile(imagePath);
    return `data:image/${imagePath.split('.').pop()};base64,${imageBuffer.toString('base64')}`;
  }
}
