# file-service
1. Find the APIKEY in the docker-compose.yml file. Set APIKEY to anything you want.
2. You will need to install Docker Compose. Use this link for instructions on how to do that: https://docs.docker.com/compose/install/. This will be used to run the actual application. 
3. Run `docker-compose up` from the project directory
4. Look for APIKEY in console output
5. The server should be running on localhost:8082. Pass apikey=hashfromstep4
6. You can upload files by posting to /upload and retrieve them from /file/fileid
