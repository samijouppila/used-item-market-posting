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

    // Slug storage for created postings for reuse later
    let slugs = [];

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
                expect(response.body).to.have.property('images');
                expect(response.body.images).to.be.array();
                expect(response.body.images.length).to.equal(0);
                expect(response.body).to.have.property('slug');
                expect(response.body.slug).to.be.string();
                expect(response.body).to.have.property('_id');
                expect(response.body._id).to.be.string();
                expect(response.body).to.have.property('createdAt');
                expect(response.body.createdAt).to.be.string();
                expect(response.body).to.have.property('updatedAt');
                expect(response.body.updatedAt).to.be.string();

                slugs.push(response.body.slug);
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

    describe("Get data on a single posting", function () {
        it("Should return posting with correct slug", async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/postings/${slugs[0]}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('slug');
                expect(response.body.slug).to.equal(slugs[0]);
            } catch (error) {
                assert.fail(error)
            }
        });

        it("Should fail with incorrect slug", async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/postings/${slugs[0]}${slugs[1]}`) //Should not exist
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(404);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('errorDescription');
            } catch (error) {
                assert.fail(error)
            }
        });
    });

    describe("Get user's postings", function () {
        it("Should return list of user's postings", async function () {
            try {
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
            } catch (error) {
                assert.fail(error)
            }
        });

        it("Should gain more entries in the list when they are created", async function () {
            try {
                const postResponse = await chai.request(apiRoot)
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
                slugs.push(postResponse.body.slug);

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
            } catch (error) {
                assert.fail(error)
            }
        });
    });

    describe("Get user's single posting", function () {
        it("Should return posting with correct authorization, userId and slug", async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/users/${testId}/postings/${slugs[0]}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('slug');
                expect(response.body.slug).to.equal(slugs[0]);
            } catch (error) {
                assert.fail(error)
            }
        });

        it("Should fail with incorrect slug", async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/users/${testId}/postings/${slugs[0]}${slugs[1]}`) //Should not exist
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(404);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('errorDescription');
            } catch (error) {
                assert.fail(error)
            }
        });
    });

    describe("Search postings", function () {
        it("Should return all previously made postings when given no query parameters", async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/postings`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('postings');
                expect(response.body.postings).to.be.array();
                expect(response.body.postings.length).to.equal(2);
                expect(response.body).to.have.property('page');
                expect(response.body.page).to.equal(1);
            } catch (error) {
                assert.fail(error)
            }
        });
        it("Should return all previously made postings when given query parameters that match", async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/postings?country=FI&city=Oulu&category=cycling`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('postings');
                expect(response.body.postings).to.be.array();
                expect(response.body.postings.length).to.equal(2);
            } catch (error) {
                assert.fail(error)
            }
        });
        it("Should return nothing when given a query parameter with no matching results", async function () {
            try {
                const response1 = await chai.request(apiRoot)
                    .get(`/postings?country=SE`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response1).to.have.property('status');
                expect(response1.status).to.equal(200);
                expect(response1).to.have.property('body');
                expect(response1.body).to.have.property('postings');
                expect(response1.body.postings).to.be.array();
                expect(response1.body.postings.length).to.equal(0);
                const response2 = await chai.request(apiRoot)
                    .get(`/postings?city=Helsinki`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response2).to.have.property('status');
                expect(response2.status).to.equal(200);
                expect(response2).to.have.property('body');
                expect(response2.body).to.have.property('postings');
                expect(response2.body.postings).to.be.array();
                expect(response2.body.postings.length).to.equal(0);
                const response3 = await chai.request(apiRoot)
                    .get(`/postings?category=car`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response3).to.have.property('status');
                expect(response3.status).to.equal(200);
                expect(response3).to.have.property('body');
                expect(response3.body).to.have.property('postings');
                expect(response3.body.postings).to.be.array();
                expect(response3.body.postings.length).to.equal(0);
            } catch (error) {
                assert.fail(error)
            }
        });
        it("Should return an empty list when given a page that has no results", async function () {
            try {
                const response = await chai.request(apiRoot)
                    .get(`/postings?page=2`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('postings');
                expect(response.body.postings).to.be.array();
                expect(response.body.postings.length).to.equal(0);
            } catch (error) {
                assert.fail(error)
            }
        });
        it("Should return previously made postings when given a startDate of today and an endDate of 2 days from now", async function () {
            try {
                const today = new Date();
                const dayAfterTomorrow = new Date(today);
                dayAfterTomorrow.setDate(today.getDate() + 2);
                const response = await chai.request(apiRoot)
                    .get(`/postings?startDate=${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}&endDate=${dayAfterTomorrow.getFullYear()}-${dayAfterTomorrow.getMonth() + 1}-${dayAfterTomorrow.getDate()}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('postings');
                expect(response.body.postings).to.be.array();
                expect(response.body.postings.length).to.equal(2);
            } catch (error) {
                assert.fail(error)
            }
        });
        it("Should return no postings when given a startDate of 2 days from now", async function () {
            try {
                const dayAfterTomorrow = new Date();
                dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
                const response = await chai.request(apiRoot)
                    .get(`/postings?startDate=${dayAfterTomorrow.getFullYear()}-${dayAfterTomorrow.getMonth() + 1}-${dayAfterTomorrow.getDate()}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('postings');
                expect(response.body.postings).to.be.array();
                expect(response.body.postings.length).to.equal(0);
            } catch (error) {
                assert.fail(error)
            }
        });
        it("Should return no postings when given an endDate of yesterday", async function () {
            try {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const response = await chai.request(apiRoot)
                    .get(`/postings?endDate=${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('postings');
                expect(response.body.postings).to.be.array();
                expect(response.body.postings.length).to.equal(0);
            } catch (error) {
                assert.fail(error)
            }
        });
    });

    describe("Modify a posting", function () {
        it('Should modify an existing posting when given new information for all fields in valid format', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .put(`/postings/${slugs[0]}`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "title": "Helkama",
                            "description": "Used red bicycle in good condition",
                            "category": "cycling",
                            "location": {
                                "country": "FI",
                                "city": "Oulu",
                                "postalCode": "90570"
                            },
                            "askingPrice": 100,
                            "deliveryTypes": {
                                "shipping": true,
                                "pickup": true
                            }
                        }
                    );
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('title');
                expect(response.body.title).to.equal('Helkama');
                expect(response.body).to.have.property('description');
                expect(response.body.description).to.equal('Used red bicycle in good condition');
                expect(response.body).to.have.property('category');
                expect(response.body.category).to.equal('cycling');
                expect(response.body).to.have.property('location');
                expect(response.body.location).to.have.property('country');
                expect(response.body.location.country).to.equal('FI');
                expect(response.body.location).to.have.property('city');
                expect(response.body.location.city).to.equal('Oulu');
                expect(response.body).to.have.property('askingPrice');
                expect(response.body.askingPrice).to.equal(100);
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
                expect(response.body).to.have.property('slug');
                expect(response.body.slug).to.be.string();
                expect(response.body).to.have.property('_id');
                expect(response.body._id).to.be.string();
                expect(response.body).to.have.property('createdAt');
                expect(response.body.createdAt).to.be.string();
                expect(response.body).to.have.property('updatedAt');
                expect(response.body.updatedAt).to.be.string();
                expect(response.body.updatedAt).to.not.equal(response.body.createdAt);
            } catch (error) {
                assert.fail(error)
            }
        });

        it('Should modify an existing posting when only given description as a field in a valid format', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .put(`/postings/${slugs[0]}`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "description": "Used green bicycle in good condition",
                        }
                    );
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('description');
                expect(response.body.description).to.equal('Used green bicycle in good condition');
            } catch (error) {
                assert.fail(error);
            }
        });

        it('Should not modify slug, createdAt or updatedAt fields if given in the request body', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .put(`/postings/${slugs[0]}`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            slug: "not-applicable-slug",
                            createdAt: "2010-09-21T17:32:28Z",
                            updatedAt: "2010-09-22T17:32:28Z"
                        }
                    );
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('slug');
                expect(response.body.slug).to.be.string();
                expect(response.body.slug).to.not.equal('not-applicable-slug');
                expect(response.body).to.have.property('_id');
                expect(response.body._id).to.be.string();
                expect(response.body._id).to.not.equal('invalididhere');
                expect(response.body).to.have.property('createdAt');
                expect(response.body.createdAt).to.be.string();
                expect(response.body.createddAt).to.not.equal("2010-09-21T17:32:28Z");
                expect(response.body).to.have.property('updatedAt');
                expect(response.body.updatedAt).to.be.string();
                expect(response.body.updatedAt).to.not.equal("2010-09-22T17:32:28Z");
            } catch (error) {
                assert.fail(error);
            }
        });

        it('Should fail if the user is attempting to set both delivery types as false', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .put(`/postings/${slugs[0]}`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "deliveryTypes": {
                                "shipping": false,
                                "pickup": false
                            }
                        }
                    );
                expect(response).to.have.property('status');
                expect(response.status).to.equal(400);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('errorDescription')
            } catch (error) {
                assert.fail(error);
            }
        });

        it('Should fail when trying to modify a non-existing posting', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .put(`/postings/${slugs[0]}${slugs[1]}`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send(
                        {
                            "title": "Helkama",
                            "description": "Used red bicycle in good condition",
                            "category": "cycling",
                            "location": {
                                "country": "FI",
                                "city": "Oulu",
                                "postalCode": "90570"
                            },
                            "askingPrice": 100,
                            "deliveryTypes": {
                                "shipping": true,
                                "pickup": true
                            }
                        }
                    );
                expect(response).to.have.property('status');
                expect(response.status).to.equal(404);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('errorDescription')
            } catch (error) {
                assert.fail(error);
            }
        });
    });

    describe("Delete a posting", function () {
        it('Should fail when trying to delete a non-existent posting', async function () {
            try {
                const response = await chai.request(apiRoot)
                    .delete(`/postings/${slugs[0]}${slugs[1]}`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Content-Type', 'application/json')
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(404);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('errorDescription')
            } catch (error) {
                assert.fail(error);
            }
        });

        it('Should delete existing posting with valid authorization', async function () {
            try {
                for (slug of slugs) {
                    const response = await chai.request(apiRoot)
                        .delete(`/postings/${slug}`)
                        .set('Authorization', `Bearer ${token}`)
                        .set('Content-Type', 'application/json')
                        .send();
                    expect(response).to.have.property('status');
                    expect(response.status).to.equal(200);
                }

                const response = await chai.request(apiRoot)
                    .get(`/users/${testId}/postings`)
                    .set('Authorization', `Bearer ${token}`)
                    .send();
                expect(response).to.have.property('status');
                expect(response.status).to.equal(200);
                expect(response).to.have.property('body');
                expect(response.body).to.have.property('postings');
                expect(response.body.postings).to.be.array();
                expect(response.body.postings.length).to.equal(0);
            } catch (error) {
                assert.fail(error)
            }
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