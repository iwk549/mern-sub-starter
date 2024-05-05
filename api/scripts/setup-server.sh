#!/bin/bash

export NODE_ENV=dev
export MONGO_URL='mongodb://localhost/mern'
export MONGO_DB_PORT=${DBPORT:-27017}
export REDIS_URL=redis://localhost:6379
export JWT_KEY=1234

#  start the redis container
REDIS_CONTAINER_NAME='App_Redis'
REDIS_IMAGE='redis/redis-stack-server:6.2.6-v9'
REDIS_CONTAINER_ID=$(docker ps -aqf "name=${REDIS_CONTAINER_NAME}")

if [ -z "$REDIS_CONTAINER_ID" ]
then
    echo "Redis container not found, starting a new one"
    docker run -p 6379:6379 -d --name ${REDIS_CONTAINER_NAME} ${REDIS_IMAGE}
else
    echo "Redis container already exists"
    docker start ${REDIS_CONTAINER_ID}
fi

# start the mongo container
MONGO_CONTAINER_NAME='App_Mongo'
MONGO_IMAGE='mongo:6.0.8'
MONGO_CONTAINER_ID=$(docker ps -aqf "name=${MONGO_CONTAINER_NAME}")

if [ -z "$MONGO_CONTAINER_ID" ]
then
    echo "Mongo container not found, starting a new one."
    docker run -d -p 27017:27017 \
        -h $(hostname) \
        --name ${MONGO_CONTAINER_NAME} ${MONGO_IMAGE} \
        --replSet=rs0 && sleep 4 \
        && docker exec ${MONGO_CONTAINER_NAME} mongosh --eval "rs.initiate();"
else
    echo "Mongo container already exists, starting."
    docker start ${MONGO_CONTAINER_ID}
fi

echo "----------"
echo "API is ready for use"
echo "- Use npm run dev to start the development server, and log in as test1@test.com, password: Password1 to access seeded data"
echo "- Or use npm run test to run all tests"
echo "----------"