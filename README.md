# Overland Function

Function for receiving location recordings from [Overland](https://overland.p3k.app/) and saving them in MongoDB.

- https://overland.p3k.app/
- https://indieweb.org/Overland
- https://github.com/aaronpk/Overland-iOS#api

## Getting Started

```
$ docker run -d --name mongo \
    -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=root \
    -e MONGO_INITDB_ROOT_PASSWORD=dev \
    mongo
$ npm ic
$ npm run lint
$ npm run test
```
