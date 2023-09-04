import { BlobServiceClient, RestError } from '@azure/storage-blob';
import { randomUUID, UUID, createHmac } from 'crypto';
import { Readable, Writable } from 'stream';
import { IBlobStoreService } from './contracts';
import Singleton from '../../shared/decorators/singleton';

const {
  AZURE_BLOB_STORAGE_CONNECTION_STRING: CONNECTION_STRING,
  AZURE_BLOB_STORAGE_PUBLIC_CONTAINER_NAME: PUBLIC_CONTAINER_NAME,
  AZURE_BLOB_STORAGE_PRIVATE_CONTAINER_NAME: PRIVATE_CONTAINER_NAME,
} = process.env;

export enum BLOB_SERVICE_ERROR_CODES {
  BLOB_NOT_FOUND,
  BLOB_ACCESS_FORBIDDEN,
}

export class BlobServiceError extends Error {
  code: BLOB_SERVICE_ERROR_CODES;

  constructor(message: string, code: BLOB_SERVICE_ERROR_CODES) {
    super(message);

    this.code = code;
  }
}

async function uploadStream(containerName: string, stream: Readable) {
  const blobId: UUID = randomUUID();

  const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobId as string);

  await blockBlobClient.uploadStream(stream);

  return blobId;
}

async function downloadStream(blobId: UUID, containerName: string, stream: Writable): Promise<void> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobId);

  try {
    const response = await blobClient.download();

    for await (const chunk of response.readableStreamBody!) {
      stream.write(chunk);
    }

  } catch (error) {
    if (error instanceof RestError) {
      if (error.code === 'BlobNotFound') throw new BlobServiceError('blob not found', BLOB_SERVICE_ERROR_CODES.BLOB_NOT_FOUND);
    }

    throw error;
  }
}

@Singleton
export default class AzureBlobStoreService implements IBlobStoreService {
  async uploadPublicStream(stream: Readable): Promise<UUID> {
    return await uploadStream(PUBLIC_CONTAINER_NAME, stream);
  }

  async uploadPrivateStream(stream: Readable): Promise<UUID> {
    return await uploadStream(PRIVATE_CONTAINER_NAME, stream);
  }

  async getPublicStream(id: UUID, stream: Writable): Promise<void> {
    await downloadStream(id, PUBLIC_CONTAINER_NAME, stream);
  }

  async getPrivateStream(accessKey: string, id: UUID, stream: Writable): Promise<void> {
    const blobAccessKey = this.getBlobAccessKeyById(id);

    if (accessKey !== blobAccessKey) throw new BlobServiceError('blob access forbidden', BLOB_SERVICE_ERROR_CODES.BLOB_ACCESS_FORBIDDEN);

    await downloadStream(id, PRIVATE_CONTAINER_NAME, stream);
  }

  getBlobAccessKeyById(blobId: UUID): string {
    // TODO: Might be a case, when access-key should be expired. JWT?
    return createHmac('sha256', process.env.BLOB_ACCESS_KEY_SALT).update(blobId).digest('hex');
  }
}
