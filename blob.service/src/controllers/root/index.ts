import { UUID } from 'crypto';
import { IBlobStoreService } from '../../services/blob-storage/contracts';
import AzureBlobStoreService, { BLOB_SERVICE_ERROR_CODES, BlobServiceError } from '../../services/blob-storage';
import { IRequest, IResponse } from '../../lib/http-server/contracts';
import { Get, Post } from '../controller-decorators';
import { STATUS_CODES as HTTP_STATUS_CODES } from '../../lib/http-server/enums';
import { BlobDTO, PrivateBlobDTO } from '../../dto/blob';
import Controller from '../base-controller';
import { IBlobDTO, IPrivateBlobDTO } from '../../dto/contracts';

const blobStoreService: IBlobStoreService = new AzureBlobStoreService();

export default class RootController extends Controller {
  @Get('/:id')
  async sendBlobStream(req: IRequest, res: IResponse) {
    const id: UUID = req.params!.get('id')! as UUID;

    try {
      await blobStoreService.getPublicStream(id, res);
    } catch (error) {
      if (error instanceof BlobServiceError) {
        if (error.code === BLOB_SERVICE_ERROR_CODES.BLOB_NOT_FOUND) {
          res.statusCode = HTTP_STATUS_CODES.NOT_FOUND;
          res.end();

          return;
        }
      }

      throw error;
    }

    res.statusCode = HTTP_STATUS_CODES.OK;
    res.end();
  }

  @Get('/:access-key/:id')
  async sendPrivateBlobStream(req: IRequest, res: IResponse) {
    const accessKey: string = req.params!.get('access-key')!;
    const id: UUID = req.params!.get('id')! as UUID;

    try {
      await blobStoreService.getPrivateStream(accessKey, id, res);
    } catch (error) {
      if (error instanceof BlobServiceError) {
        if (error.code === BLOB_SERVICE_ERROR_CODES.BLOB_ACCESS_FORBIDDEN) {
          res.statusCode = HTTP_STATUS_CODES.FORBIDDEN;
          res.end();

          return;
        }
      }

      throw error;
    }

    res.statusCode = HTTP_STATUS_CODES.OK;
    res.end();
  }

  @Post('/upload')
  async getBlobStream(req: IRequest, res: IResponse) {
    const blobId: UUID = await blobStoreService.uploadPublicStream(req);
    const blobDTO: IBlobDTO = new BlobDTO(blobId);

    res.statusCode = HTTP_STATUS_CODES.CREATED;
    res.json(blobDTO);
  }

  @Post('/upload/private')
  async getPrivateBlobStream(req: IRequest, res: IResponse) {
    const blobId: UUID = await blobStoreService.uploadPrivateStream(req);
    const accessKey: string = blobStoreService.getBlobAccessKeyById(blobId);
    const privateBlobDTO: IPrivateBlobDTO = new PrivateBlobDTO(blobId, accessKey);

    res.statusCode = HTTP_STATUS_CODES.CREATED;
    res.json(privateBlobDTO);
  }
}
