const chai = require("chai");
chai.use(require('chai-http'));
const asserttype = require('chai-asserttype');
chai.use(asserttype);
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

describe('User authentication', function () {
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

    describe('Login authentication', function () {
        before(async function () {
            const response = await createTestUser(); // Make sure there is a user to authenticate
            testId = response.body._id
        });

        it('Should succeed when given correct username and password', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get("/auth/login")
                    .set('Authorization', 'Basic bWF0dGltZWk6TUtPMDk4VUhC')
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('token');
                expect(response.body.token).to.be.string()
                token = response.body.token;
            } catch (error) {
                assert.fail(error);
            }
        });

        it('Should fail when given correct username but incorrect password', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get("/auth/login")
                    .set('Authorization', 'Basic bWF0dGltZWk6TUtPMDk4VUg=')
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(401);
            } catch (error) {
                assert.fail(error);
            }
        });

        it('Should fail when trying to log in with non-existing username', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get("/auth/login")
                    .set('Authorization', 'Basic bWF0dGltZWlrOk1LTzA5OFVI')
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(401);
            } catch (error) {
                assert.fail(error);
            }
        });

        it('Should fail when given no Authorization header in request', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get("/auth/login")
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(401);
            } catch (error) {
                assert.fail(error);
            }
        });
    });
    describe('Token authentication', function () {
        it('Should succeed for protected route with valid token', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/users/${testId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
            } catch (error) {
                assert.fail(error);
            }
        })
        it('Should fail for protected route with invalid token', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/users/${testId}`)
                    .set('Authorization', `Bearer ${token}thisShouldInvalidateToken`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(401);
            } catch (error) {
                assert.fail(error);
            }
        })
        it('Should fail for protected route no token', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/users/${testId}`)
                    .set('Authorization', `Bearer ${token}thisShouldInvalidateToken`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(401);
            } catch (error) {
                assert.fail(error);
            }
        })
        it('Should not allow a valid token with a different user to access a protected route for user', async function () {
            try {
                // Setup for test
                const secondUserResponse = await chai.request(apiRoot)
                    .post("/users")
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "username": "johndoe",
                            "password": "MKO098UHB",
                            "birthDate": "1999-02-20",
                            "contactInformation": {
                                "name": "John Doe",
                                "email": "jd@mail.com",
                                "phoneNumber": "+358 40 765 4321"
                            }
                        }
                    );
                const loginResponse = await chai.request(apiRoot)
                    .get("/auth/login")
                    .set('Authorization', 'Basic am9obmRvZTpNS08wOThVSEI=')
                    .send();
                const response = await chai.request(apiRoot)
                    .get(`/users/${testId}`)
                    .set('Authorization', `Bearer ${loginResponse.body.token}`)
                    .send();

                // Actual test
                expect(response).to.have.property('status');
                expect(response.status).to.equal(401);

                // Clean up
                await chai.request(apiRoot)
                    .delete(`/users/${secondUserResponse.body._id}`)
                    .set('Authorization', `Bearer ${loginResponse.body.token}`)
                    .send();
            } catch (error) {
                assert.fail(error);
            }
        })

        after(async function () {
            // Delete existing resources from test database
            await chai.request(apiRoot)
                    .delete(`/users/${testId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
        });
    });
});