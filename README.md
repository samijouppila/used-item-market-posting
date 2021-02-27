# used-item-market-posting
Microservice version of used-item-market. Same functionality as original, but split into 3 microservices that communicate with each other.

This repository contains the posting service.

[Original repository](https://github.com/samijouppila/used-item-market)

[Documentation](https://t8josa01-used-item-market.herokuapp.com/api/documentation)


# Setup
Copy and rename .env.example to .env. Insert the following environment variables:
- MONGODB_PRODUCTION_URI: URI to your MongoDB production database
- MONGODB_TEST_URI: URI to your MongoDB test database
- JWT_SECRET: Your JWT secret.

npm install

# Usage
npm start

# Test
Running npm test starts instance in test mode. Use api-service to run tests once conditions are met.

[API Service](https://github.com/samijouppila/used-item-market-api)

npm test
