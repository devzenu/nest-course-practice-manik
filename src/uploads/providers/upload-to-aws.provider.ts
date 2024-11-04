import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadToAwsProvider {
  constructor(private readonly configService: ConfigService) {}
  public async fileUpload(file: Express.Multer.File) {
    const s3 = new S3();

    try {
      const uploadResult = await s3
        .upload({
          Bucket: this.configService.get<string>('appConfig.awsBucketName'),
          Body: file.buffer,
          Key: this.generateFileName(file),
          ContentType: file.mimetype,
        })
        .promise(); // Promisify the request

      // Return the file name
      return uploadResult.Key;
    } catch (error) {
      // if the upload is not successfull we can go ahead and throw an error
      throw new RequestTimeoutException(error);
    }
  }

  private generateFileName(file: Express.Multer.File) {
    //1-Extract the file name from the file itself
    let name = file.originalname.split('.')[0];
    //2-Remove white spaces inside the file name that user has uploaded
    name.replace(/\s/g, '').trim();
    //3-Extract the extension of the file
    let extension = path.extname(file.originalname); //this should give us extension of the file
    //(Each file would have an extension for images  let say dot png extension or dot jpg exension )
    //4-Generate TimeStamp
    let timeStamp = new Date().getTime().toString().trim();
    // (to make file name unique we are going to generate a timestamp and
    //append the file name with this time stamp)
    //(further make sure that each file name has unique id , we are going to return
    //the concatednated file name along with a Uuid , which is again concatenated
    //to the file name , which has timeStamps attached to it .)
    //return file name from here
    //5-Return file Uuid

    return `${name}-${timeStamp}-${uuidv4()}${extension}`;

    //now we going to add extension here to
    //Always remember extension always contains dot , so you dont need to add the
    // period seprately
  }
}
