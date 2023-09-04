import {
  INewBlobDTO,
  IBlobDTO,
  IPrivateBlobDTO,
} from './contracts';
import { UUID } from 'node:crypto';

export class NewBlobDTO extends Blob implements INewBlobDTO {
  
}

export class BlobDTO implements IBlobDTO {
  id: UUID;

  constructor(id: UUID) {
    this.id = id
  }
}

export class PrivateBlobDTO extends BlobDTO implements IPrivateBlobDTO {
  accessKey: string;

  constructor(blobId: UUID, accessKey: string) {
    super(blobId);

    this.accessKey = accessKey;
  }
}
