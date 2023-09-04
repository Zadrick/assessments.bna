import server from './controllers';

const PORT: number = +process.env.BLOB_SERVICE_PORT;
const HOST = process.env.BLOB_SERVICE_HOST;

server.listen(PORT, HOST, () => console.log(`started at port: ${PORT}`));
