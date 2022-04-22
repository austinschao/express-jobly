"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  testAdminToken,
  jobId
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 100000,
    equity: "0.081",
    companyHandle: "c1",
  };

  test("ok for isAdmin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${testAdminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });

  test("not ok for non admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c1",
        },
        {
          title: "j2",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c2",
        },
        {
          title: "j3",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c4",
        },
      ],
    });
  });

  // test("ok for anon, filtering results", async function () {
  //   const resp = await request(app)
  //     .get("/jobs")
  //     .query({ title: "j1", minEmployees: 1, maxEmployees: 1 });
  //   expect(resp.body).toEqual({
  //     jobs: [
  //       {
  //         handle: "c1",
  //         name: "C1",
  //         description: "Desc1",
  //         numEmployees: 1,
  //         logoUrl: "http://c1.img",
  //       },
  //     ],
  //   });
  // });

  // test("ok for anon, invalid filter", async function () {
  //   const resp = await request(app).get("/jobs?location=CA");
  //   // .query({ location: 'CA' });
  //   expect(resp.statusCode).toEqual(400);
  // });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:jobId */

describe("GET /jobs/:jobId", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobId}`);
    expect(resp.body).toEqual({
      company: {
        title: "j1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  // test("works for anon: company w/o jobs", async function () {
  //   const resp = await request(app).get(`/jobs/j2`);
  //   expect(resp.body).toEqual({
  //     company: {
  //       title: "j2",
  //       salary: 100000,
  //       equity: "0.5",
  //       companyHandle: "c2",
  //     },
  //   });
  // });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:jobId */

describe("PATCH /jobs/:jobId", function () {
  test("works for isAdmin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        name: "j1-new",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.body).toEqual({
      company: {
        title: "j1-new",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("fails for non admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        name: "j1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/${jobId}`).send({
      name: "j1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/nope`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on company_handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        companyHandle: "c1-new",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:jobId */

describe("DELETE /jobs/:jobId", function () {
  test("works for isAdmin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobId}`)
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.body).toEqual({ deleted: "j1" });
  });

  test("fails for non admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobId}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/${jobId}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/nope`)
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
