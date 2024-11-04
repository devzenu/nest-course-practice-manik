import { Global, Module } from '@nestjs/common';
import { MailService } from './providers/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('appConfig.mailHost'), //'sandbox.smtp.mailtrap.io',
          secure: false,
          port: 2525, //587,
          auth: {
            user: config.get('appConfig.smtpUsername'), //'4d0dbb4ffc2c1d',
            pass: config.get('appConfig.smtpPassword'), //'4d9e04c0c7ba62',
          },
          //debug: true,
          //logger: true,
        },
        defaults: {
          // from: `"My Blog" <no-repy@nestjs-blog.com>`,
          from: `"My Blog" <no-repy@nestjs-blog.com>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter({
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
