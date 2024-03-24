## Run Mongo db
docker run -d  --name mongo -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=worker -v /workspaces/caro/MCTS/data:/data/db --log-opt max-size=10m --log-opt max-file=3 --restart always -p 27017:27017 mongo

## Run Mongo express
docker run --net=host -d --name mongo-express -e ME_CONFIG_MONGODB_SERVER=localhost -e ME_CONFIG_BASICAUTH_USERNAME=admin -e ME_CONFIG_BASICAUTH_PASSWORD=worker -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin -e ME_CONFIG_MONGODB_ADMINPASSWORD=worker -p 8081:8081 --log-opt max-size=10m --log-opt max-file=3 --restart always  mongo-express