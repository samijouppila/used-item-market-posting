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

  // Jwt token and test user id storage for reuse later
  let token;
  let testId;

  describe('Register user', function () {
    it('Should create a new user successfully', async function () {
      try {
        const response = await createTestUser();
        expect(response).to.have.property('status');
        expect(response.status).to.equal(201);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('username');
        expect(response.body.username).to.equal('mattimei');
        expect(response.body).to.have.property('birthDate');
        expect(response.body.birthDate).to.equal("1999-02-20");
        expect(response.body).to.have.property('contactInformation');
        expect(response.body.contactInformation).to.have.property('name');
        expect(response.body.contactInformation).to.have.property('email');
        expect(response.body.contactInformation).to.have.property('phoneNumber');
        expect(response.body).to.have.property('_id');

        // Store created id for reuse in variable id
        testId = response.body._id
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
        assert.fail(error);
      }
    })

  });
  describe('Get selected user details', function () {
    before(async function () {
      // Fetch jwt token, stored elsewhere for reuse after this
      const tokenResponse = await chai.request(apiRoot)
        .get("/auth/login")
        .set('Authorization', 'Basic bWF0dGltZWk6TUtPMDk4VUhC')
        .send();
      token = tokenResponse.body.token;
    })

    it('Should return correct stored data for user when a valid id is given', async function () {
      try {
        const response = await chai.request(apiRoot)
          .get(`/users/${testId}`)
          .set('Authorization', `Bearer ${token}`)
          .send();
        expect(response).to.have.property('status');
        expect(response.status).to.equal(200);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('username');
        expect(response.body.username).to.equal('mattimei');
        expect(response.body).to.have.property('birthDate');
        expect(response.body.birthDate).to.equal("1999-02-20");
        expect(response.body).to.have.property('contactInformation');
        expect(response.body.contactInformation).to.have.property('name');
        expect(response.body.contactInformation.name).to.equal('Matti Meikäläinen');
        expect(response.body.contactInformation).to.have.property('email');
        expect(response.body.contactInformation.email).to.equal('matti.m@mail.com');
        expect(response.body.contactInformation).to.have.property('phoneNumber');
        expect(response.body.contactInformation.phoneNumber).to.equal('+358 40 1234 567');
        expect(response.body).to.have.property('_id');
        expect(response.body._id).to.equal(testId)
      } catch (error) {
        assert.fail(error);
      }
    });

    it('Should fail to find user information when given an incorrect id', async function () {
      try {
        const response = await chai.request(apiRoot)
          .get(`/users/${testId}-this-cannot-exist-`)
          .set('Authorization', `Bearer ${token}`)
          .send();
        expect(response).to.have.property('status');
        expect(response.status).not.to.equal(200);
      } catch (error) {
        assert.fail(error);
      }
    });
  });
  describe('Modify user details', function () {
    it('Should modify user details when given all possible fields', async function () {
      try {
        const response = await chai.request(apiRoot)
          .put(`/users/${testId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            "password": "UHBMKO098",
            "birthDate": "2000-02-20",
            "contactInformation": {
              "name": "John Doe",
              "email": "jd@mail.com",
              "phoneNumber": "+358 40 765 4321"
            }
          });
        expect(response).to.have.property('status');
        expect(response.status).to.equal(200);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('username');
        expect(response.body.username).to.equal('mattimei');
        expect(response.body).to.have.property('birthDate');
        expect(response.body.birthDate).to.equal("2000-02-20");
        expect(response.body).to.have.property('contactInformation');
        expect(response.body.contactInformation).to.have.property('name');
        expect(response.body.contactInformation.name).to.equal('John Doe');
        expect(response.body.contactInformation).to.have.property('email');
        expect(response.body.contactInformation.email).to.equal('jd@mail.com');
        expect(response.body.contactInformation).to.have.property('phoneNumber');
        expect(response.body.contactInformation.phoneNumber).to.equal('+358 40 765 4321');
        expect(response.body).to.have.property('_id');
        expect(response.body._id).to.equal(testId)
        const tokenResponse = await chai.request(apiRoot)
          .get("/auth/login")
          .set('Authorization', 'Basic bWF0dGltZWk6VUhCTUtPMDk4')
          .send();
        expect(tokenResponse).to.have.property('status');
        expect(tokenResponse.status).to.equal(200);
      } catch (error) {
        assert.fail(error);
      }
    });

    it('Should modify user details when only given name as an updated field', async function () {
      try {
        const response = await chai.request(apiRoot)
          .put(`/users/${testId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            "contactInformation": {
              "name": "Jane Doe",
            }
          });
        expect(response).to.have.property('status');
        expect(response.status).to.equal(200);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('username');
        expect(response.body.username).to.equal('mattimei');
        expect(response.body).to.have.property('birthDate');
        expect(response.body.birthDate).to.equal("2000-02-20");
        expect(response.body).to.have.property('contactInformation');
        expect(response.body.contactInformation).to.have.property('name');
        expect(response.body.contactInformation.name).to.equal('Jane Doe');
        expect(response.body.contactInformation).to.have.property('email');
        expect(response.body.contactInformation.email).to.equal('jd@mail.com');
        expect(response.body.contactInformation).to.have.property('phoneNumber');
        expect(response.body.contactInformation.phoneNumber).to.equal('+358 40 765 4321');
        expect(response.body).to.have.property('_id');
        expect(response.body._id).to.equal(testId)
      } catch (error) {
        assert.fail(error);
      }
    });

    it('Should not update username or _id if given in request', async function () {
      try {
        const response = await chai.request(apiRoot)
          .put(`/users/${testId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            "username": "johndoe",
            "_id": "newuseridashiogabsoihajsdsakbjd"
          });
        expect(response).to.have.property('status');
        expect(response.status).to.equal(200);
        expect(response).to.have.property('body');
        expect(response.body).to.have.property('username');
        expect(response.body.username).to.equal('mattimei');
        expect(response.body).to.have.property('birthDate');
        expect(response.body.birthDate).to.equal("2000-02-20");
        expect(response.body).to.have.property('contactInformation');
        expect(response.body.contactInformation).to.have.property('name');
        expect(response.body.contactInformation.name).to.equal('Jane Doe');
        expect(response.body.contactInformation).to.have.property('email');
        expect(response.body.contactInformation.email).to.equal('jd@mail.com');
        expect(response.body.contactInformation).to.have.property('phoneNumber');
        expect(response.body.contactInformation.phoneNumber).to.equal('+358 40 765 4321');
        expect(response.body).to.have.property('_id');
        expect(response.body._id).to.equal(testId)
      } catch (error) {
        assert.fail(error);
      }
    });
    it('Should fail to modify user information when given an incorrect id', async function () {
      try {
        const response = await chai.request(apiRoot)
          .get(`/users/${testId}-this-cannot-exist-`)
          .set('Authorization', `Bearer ${token}`)
          .send();
        expect(response).to.have.property('status');
        expect(response.status).not.to.equal(200);
      } catch (error) {
        assert.fail(error);
      }
    });
  });
});
