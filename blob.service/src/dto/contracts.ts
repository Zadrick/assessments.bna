import { UUID } from 'node:crypto';

export interface INewBlobDTO extends Blob {
  
}

export interface IBlobDTO {
  id: UUID;
}

export interface IPrivateBlobDTO extends IBlobDTO {
  accessKey: string;
}
