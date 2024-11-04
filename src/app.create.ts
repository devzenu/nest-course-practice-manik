import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

export function appCreate(app: INestApplication): void {
  /**
   * Use Validation Pipes Globally
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // swagger configuration
  const SwaggerConfig = new DocumentBuilder()
    .setTitle('Nestjs Masterclass -Blog app API')
    .setDescription('Use the base API URL as http://localhost:8000')
    .setTermsOfService('http://localhost:8000/terms-of-service ')
    .setLicense(
      'MIT License',
      'https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt',
    )
    .addServer('http://localhost:8000')
    .setVersion('1.0')
    .build();
  //instantiate document object
  const document = SwaggerModule.createDocument(app, SwaggerConfig);
  SwaggerModule.setup('api', app, document); // our nest js swagger docs ready for use

  //setup the aws sdk used uploading the file to  aws s3 bucket
  const configService = app.get(ConfigService);
  config.update({
    credentials: {
      accessKeyId: configService.get('appConfig.awsAccessKeyId'),
      secretAccessKey: configService.get('appConfig.awsSecretAccessKey'),
    },
    region: configService.get('appConfig.awsRegion'),
  });

  //enable cors
  app.enableCors();
  //Add global Interceptors
  //remove this interceptoprs because now we are going to apply api version in module form globally
  //app.useGlobalInterceptors(new DataResponseInterceptor());
}
