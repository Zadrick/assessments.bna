import { UUID } from 'node:crypto';
import { Readable, Writable } from 'node:stream';
import { PrivateBlobDTO } from '../../dto/blob';

export interface IBlobStoreService {
  uploadPublicStream(stream: Readable): Promise<UUID>;
  uploadPrivateStream(stream: Readable): Promise<UUID>;

  getPublicStream(blobId: UUID, stream: Writable): Promise<void>;
  getPrivateStream(accessKey: string, blobId: UUID, stream: Writable): Promise<void>;

  getBlobAccessKeyById(blobId: UUID): string;
}
