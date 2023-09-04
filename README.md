# assessment.bna

Create a simple node.js microservice to store user-uploaded files in Azure blob storage service.
Files should be stored in the private and public domain (private files should be accessible only by key)

There should be two endpoints:
- POST /upload - to upload the file
- GET  /:file-unique-id - to read the file as a stream (e.g., Content-Type: image/png)
- GET  /:file-access-key/:file-unique-id -to read the private file as a stream

Implementation must be done in typescript.

Please avoid using any web frameworks(express, next, koa ,etc…)
