import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { Express } from 'express';
import { UploadsService } from './providers/uploads.service';
//import { AuthType } from 'src/auth/enums/auth-type.enum';
//import { Auth } from 'src/auth/decorators/auth.decorator';

//@Auth(AuthType.None)
@Controller('uploads')
export class UploadsController {
  constructor(
    /**
     * Inject uploadService
     */
    private readonly uploadService: UploadsService,
  ) {}
  @UseInterceptors(FileInterceptor('file'))
  @ApiHeaders([
    { name: 'Content-Type', description: 'multipart/form-data' },
    { name: 'Authorization', description: 'Bearer Token' },
  ])
  @ApiOperation({
    summary: 'upload a new image to the server ',
  })
  @Post('file')
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }
}
