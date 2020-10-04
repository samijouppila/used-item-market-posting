const chai = require("chai");
const { deleteOne } = require("../models/User");
chai.use(require('chai-http'));
const expect = require("chai").expect;
const assert = require("chai").assert;
const apiRoot = "http://localhost:3000/api";

const server = require("../server");

const createTestUser = async () => {
  return await chai.request(apiRoot)
    .post("/users")
    .set('Content-Type', 'application/json')
    .send(
      {
        "username": "mattimei",
        "password": "MKO098UHB",
        "birthDate": "1999-02-20",
        "contactInformation": {
          "name": "Matti Meikäläinen",
          "email": "matti.m@mail.com",
          "phoneNumber": "+358 40 1234 567"
        }
      }
  );
}

describe('User routes', function () {
  before(async function () {
    this.timeout(0); // Disable timeout due to db connection setup potentially taking over 2000 ms
    await server.start("test")
  });

  after(function () {
    server.close()
  });

  describe('Register user', function () {
    it('Should create a new user successfully', async function () {
      try {
        const response = await createTestUser();
        expect(response).to.have.property('status');
        expect(response.status).to.equal(201);
      } catch(error) {
        assert.fail(error);
      }
    });

    it('Should fail if username exists already', async function () {
      try {
        const response = await createTestUser();
        expect(response).to.have.property('status');
        expect(response.status).to.equal(400);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('errorDescription');
        expect(response.body.errorDescription).to.equal('User with that username already exists')
      } catch(error) {
        assert.fail(error);
      }
    })

    it('Should fail if username field is missing', async function () {
      try {
        const response = await chai.request(apiRoot)
          .post("/users")
          .set('Content-Type', 'application/json')
          .send(
            {
              "password": "MKO098UHB",
              "birthDate": "1999-02-20",
              "contactInformation": {
                "name": "Matti Meikäläinen",
                "email": "matti.m@mail.com",
                "phoneNumber": "+358 40 1234 567"
              }
            }
        );
        expect(response).to.have.property('status');
        expect(response.status).to.equal(400);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('errorDescription');
      } catch(error) {
        assert.fail(error);
      }
    })

    it('Should fail if password field is missing', async function () {
      try {
        const response = await chai.request(apiRoot)
          .post("/users")
          .set('Content-Type', 'application/json')
          .send(
            {
              "username": "seconduser",
              "birthDate": "1999-02-20",
              "contactInformation": {
                "name": "Matti Meikäläinen",
                "email": "matti.m@mail.com",
                "phoneNumber": "+358 40 1234 567"
              }
            }
        );
        expect(response).to.have.property('status');
        expect(response.status).to.equal(400);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('errorDescription');
      } catch(error) {
        assert.fail(error);
      }
    })

    it('Should fail if both email and phone number are missing from contact information', async function () {
      try {
        const response = await chai.request(apiRoot)
          .post("/users")
          .set('Content-Type', 'application/json')
          .send(
            {
              "username": "seconduser",
              "password": "MKO098UHB",
              "birthDate": "1999-02-20",
              "contactInformation": {
                "name": "Matti Meikäläinen"
              }
            }
        );
        expect(response).to.have.property('status');
        expect(response.status).to.equal(400);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('errorDescription');
      } catch(error) {
        assert.fail(error);
      }
    })
  });
});
