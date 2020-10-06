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

describe('User routes', function () {

    // Jwt token and test user id storage for reuse later
    let token;
    let testId;

    before(async function () {
        this.timeout(0); // Disable timeout due to db connection setup potentially taking over 2000 ms
        await server.start("test")

        const creationResponse = await createTestUser(); // Make sure there is a user to authenticate
        testId = creationResponse.body._id

        const loginResponse = await chai.request(apiRoot)
            .get("/auth/login")
            .set('Authorization', 'Basic bWF0dGltZWk6TUtPMDk4VUhC')
            .send();
        token = loginResponse.body.token;
    });

    describe('Create new posting', function () {
        it('Should successfully create a new posting with valid request body', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .post("/postings")
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "title": "Helkama Jopo",
                            "description": "Used blue bicycle in good condition",
                            "category": "cycling",
                            "location": {
                                "country": "FI",
                                "city": "Oulu",
                                "postalCode": "90570"
                            },
                            "askingPrice": 150,
                            "deliveryTypes": {
                                "shipping": true,
                                "pickup": true
                            }
                        }
                    );
                expect(response).to.have.property('status');
                expect(response.status).to.equal(201);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('title');
                expect(response.body.title).to.equal('Helkama Jopo');
                expect(response.body).to.have.property('description');
                expect(response.body.description).to.equal('Used blue bicycle in good condition');
                expect(response.body).to.have.property('category');
                expect(response.body.category).to.equal('cycling');
                expect(response.body).to.have.property('location');
                expect(response.body.location).to.have.property('country');
                expect(response.body.location.country).to.equal('FI');
                expect(response.body.location).to.have.property('city');
                expect(response.body.location.city).to.equal('Oulu');
                expect(response.body).to.have.property('askingPrice');
                expect(response.body.askingPrice).to.equal(150);
                expect(response.body).to.have.property('deliveryTypes');
                expect(response.body.deliveryTypes).to.have.property('shipping');
                expect(response.body.deliveryTypes.shipping).to.equal(true);
                expect(response.body.deliveryTypes).to.have.property('pickup');
                expect(response.body.deliveryTypes.pickup).to.equal(true);
                expect(response.body).to.have.property('seller');
                expect(response.body.seller).to.have.property('contactInformation');
                expect(response.body.seller.contactInformation).to.have.property('name');
                expect(response.body.seller.contactInformation.name).to.equal('Matti Meikäläinen');
                expect(response.body.seller.contactInformation).to.have.property('email');
                expect(response.body.seller.contactInformation.email).to.equal('matti.m@mail.com');
                expect(response.body.seller.contactInformation).to.have.property('phoneNumber');
                expect(response.body.seller.contactInformation.phoneNumber).to.equal('+358 40 1234 567');
                // -- TODO Images
                /*expect(response.body).to.have.property('images');
                expect(response.body.images).to.be.array();
                expect(response.body.images.length).to.equal(0);*/
                expect(response.body).to.have.property('slug');
                expect(response.body.slug).to.be.string();
                expect(response.body).to.have.property('_id');
                expect(response.body._id).to.be.string();
                expect(response.body).to.have.property('createdAt');
                expect(response.body.createdAt).to.be.string();
                expect(response.body).to.have.property('updatedAt');
                expect(response.body.createdAt).to.be.string();
            } catch (error) {
                assert.fail(error)
            }
        });

        it('Should fail to create a posting when missing required field title', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .post("/postings")
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "description": "Used blue bicycle in good condition",
                            "category": "cycling",
                            "location": {
                                "country": "FI",
                                "city": "Oulu",
                                "postalCode": "90570"
                            },
                            "askingPrice": 150,
                            "deliveryTypes": {
                                "shipping": true,
                                "pickup": true
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
        });

        it('Should fail to create a posting when given no request body', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .post("/postings")
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(400);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('errorDescription');
            } catch (error) {
                assert.fail(error);
            }
        });

        it('Should fail to create a posting when all delivery types are set as false', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .post("/postings")
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "title": "Helkama Jopo",
                            "description": "Used blue bicycle in good condition",
                            "category": "cycling",
                            "location": {
                                "country": "FI",
                                "city": "Oulu",
                                "postalCode": "90570"
                            },
                            "askingPrice": 150,
                            "deliveryTypes": {
                                "shipping": false,
                                "pickup": false
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
        });
    });

    describe("Get user's postings", function () {
        it("Should return list of user's postings", async function () {
            const response = await chai.request(apiRoot)
                .get(`/users/${testId}/postings`)
                .set('Authorization', `Bearer ${token}`)
                .send();
            expect(response).to.have.property('status');
            expect(response.status).to.equal(200);
            expect(response).to.have.property('body');
            expect(response.body).to.have.property('postings');
            expect(response.body.postings).to.be.array();
            expect(response.body.postings.length).to.equal(1);
            expect(response.body.postings[0]).to.have.property('title')
            expect(response.body.postings[0].title).to.equal('Helkama Jopo');
        });

        it("Should gain more entries in the list when they are created", async function () {
            await chai.request(apiRoot)
                    .post("/postings")
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "title": "Helkama Jopo",
                            "description": "Used blue bicycle in good condition",
                            "category": "cycling",
                            "location": {
                                "country": "FI",
                                "city": "Oulu",
                                "postalCode": "90570"
                            },
                            "askingPrice": 150,
                            "deliveryTypes": {
                                "shipping": true,
                                "pickup": true
                            }
                        }
                    );
            const response = await chai.request(apiRoot)
                .get(`/users/${testId}/postings`)
                .set('Authorization', `Bearer ${token}`)
                .send();
            expect(response).to.have.property('status');
            expect(response.status).to.equal(200);
            expect(response).to.have.property('body');
            expect(response.body).to.have.property('postings');
            expect(response.body.postings).to.be.array();
            expect(response.body.postings.length).to.equal(2);
        });
    });

    after(async function () {
        // Delete existing resources from test database
        await chai.request(apiRoot)
            .delete(`/users/${testId}`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        server.close()
    });
});