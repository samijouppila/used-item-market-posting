# used-item-market
Used Item Market API for course Cloud Integration 2020

[Deployed at heroku](https://t8josa01-used-item-market.herokuapp.com/api)

[Documentation](https://t8josa01-used-item-market.herokuapp.com/api/documentation)

Note: They are deployed using the free tier on Heroku. This means they may be asleep for a few minutes when you try to access them the first time, so a request may take some time to finish initially.


# Setup
Copy and rename .env.example to .env. Insert the following environment variables:
- MONGODB_PRODUCTION_URI: URI to your MongoDB production database
- MONGODB_TEST_URI: URI to your MongoDB test database
- JWT_SECRET: Your JWT secret.

npm install

# Usage
npm start

# Test
npm test
