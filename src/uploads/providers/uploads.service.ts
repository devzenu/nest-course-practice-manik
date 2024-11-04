import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../upload.entity';
import { UploadToAwsProvider } from './upload-to-aws.provider';
import { ConfigService } from '@nestjs/config';
import { UploadFile } from '../interfaces/upload-file.interface';
import { fileType } from '../enums/file-types.enum';

@Injectable()
export class UploadsService {
  constructor(
    /**
     * Inject uploadToAwsProvider
     */
    private readonly uploadToAwsProvider: UploadToAwsProvider,
    /**
     * Inject UploadRepository
     */
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,

    /**
     * Inject ConfigService
     */
    private readonly configService: ConfigService,
  ) {}
  public async uploadFile(file: Express.Multer.File) {
    //we grabing the  Mime file in above line ,
    //0-throw an error for any  unsupposted MIME types
    //check the MIME types within the condition
    //in this i want to create an array that would include all supporeted Mime types

    console.log(file, 'file');

    if (
      !['image/gif', 'image/jpeg', 'image/jpg', 'image/png'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('MIME type not supported');
    }
    //if the file is not of these Mimem types, we want to throw an error
    try {
      // Upload file to AWS S3 bucket,
      const path = await this.uploadToAwsProvider.fileUpload(file);
      //(once file hasbeen added to s3 bucket url has been genrated )
      //2-Genereate new Entry in DB
      const uploadFile: UploadFile = {
        name: path,
        path: `${this.configService.get<string>('appConfig.awsCloudFrontUrl')}/${path}`,
        type: fileType.IMAGE,
        mime: file.mimetype,
        size: file.size,
      };

      console.log(uploadFile, 'uploadFile');

      //(this new entry db would contain clound front url that wast generated in 1st step )

      //create an entry in db
      // create an upload
      const upload = this.uploadRepository.create(uploadFile);
      return await this.uploadRepository.save(upload);
      //3-
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
