declare namespace NodeJS {
  interface ProcessEnv {
    BLOB_SERVICE_PROTOCOL: string;
    BLOB_SERVICE_HOST: string;
    BLOB_SERVICE_PORT: string;

    AZURE_BLOB_STORAGE_CONNECTION_STRING: string;
    AZURE_BLOB_STORAGE_PUBLIC_CONTAINER_NAME: string;
    AZURE_BLOB_STORAGE_PRIVATE_CONTAINER_NAME: string;
    BLOB_ACCESS_KEY_SALT: string;
  }
}