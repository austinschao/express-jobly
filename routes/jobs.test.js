"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Job = require("../models/job");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  testAdminToken,
  jobsId,
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
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c3",
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
  //         id: expect.any(Number),
  //         handle: "j1",
  //         name: "J1",
  //         equity: "0.5",
  //         companyHandle: "c1",
  //       },
  //     ],
  //   });
  // });

  // test("ok for anon, invalid filter", async function () {
  //   const resp = await request(app).get("/jobs?location=CA");
  //   // .query({ location: 'CA' });
  //   expect(resp.statusCode).toEqual(400);
  // });

  // test("fails: test next() handler", async function () {
  //   // there's no normal failure event which will cause this route to fail ---
  //   // thus making it hard to test that the error-handler works with it. This
  //   // should cause an error, all right :)
  //   await db.query("DROP TABLE jobs CASCADE");
  //   const resp = await request(app)
  //     .get("/jobs")
  //     .set("authorization", `Bearer ${u1Token}`);
  //   expect(resp.statusCode).toEqual(500);
  // });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobsId[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobsId[0],
        title: "j1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/jobs/${jobsId[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobsId[0],
        title: "j1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for isAdmin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobsId[0]}`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "j1-new",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("fails for non admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobsId[0]}`)
      .send({
        name: "j1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/${jobsId[0]}`).send({
      name: "j1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on company_handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobsId[0]}`)
      .send({
        companyHandle: "c1-new",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobsId[0]}`)
      .send({
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for isAdmin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobsId[0]}`)
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.body).toEqual({ deleted: `${jobsId[0]}` });
  });

  test("fails for non admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobsId[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/${jobsId[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
