"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 100000,
    equity: 0.5,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'new'`
    );
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: "New",
        equity: "New equity",
        company_handle: 1,
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Company.create(newJob);
      await Company.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: 100000,
        equity: 0.5,
        company_handle: "c1",
      },
      {
        title: "c2",
        salary: 100000,
        equity: 0.5,
        company_handle: "c2",
      },
      {
        title: "c3",
        salary: 100000,
        equity: 0.5,
        company_handle: "c3",
      },
    ]);
  });
});

/************************************** findFiltered */

// describe("findFiltered", function () {
//   test("works: all filters (3)", async function () {
//     const dataToFilter = { salary: "c", minEmployees: 1, maxEmployees: 1 };
//     let jobs = await Company.findFiltered(dataToFilter);
//     expect(jobs).toEqual([
//       {
//         title: "c1",
//         salary: "C1",
//         equity: "Desc1",
//         company_handle: 1,
//         logoUrl: "http://c1.img",
//       },
//     ]);
//   });
//   test("works: salary: partial salary, case-insensitive", async function () {
//     const dataToFilter = { salary: "c" };
//     let jobs = await Company.findFiltered(dataToFilter);
//     expect(jobs).toEqual([
//       {
//         title: "c1",
//         salary: "C1",
//         equity: "Desc1",
//         company_handle: 1,
//       },
//       {
//         title: "c2",
//         salary: "C2",
//         equity: "Desc2",
//         company_handle: 2,
//       },
//       {
//         title: "c3",
//         salary: "C3",
//         equity: "Desc3",
//         company_handle: 3,
//       },
//     ]);
//   });
//   test("works: single filter (1)", async function () {
//     const dataToFilter = { minEmployees: 2 };
//     let jobs = await Company.findFiltered(dataToFilter);
//     expect(jobs).toEqual([
//       {
//         title: "c2",
//         salary: "C2",
//         equity: "Desc2",
//         company_handle: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         title: "c3",
//         salary: "C3",
//         equity: "Desc3",
//         company_handle: 3,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//   });
//   test("works: conflicting filters", async function () {
//     const dataToFilter = {};
//     try {
//       await Company.findFiltered(dataToFilter);
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get("j1");
    expect(job).toEqual({
      title: "j1",
      salary: 100000,
      equity: 0.5,
      company_handle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    salary: 100,
    equity: 0.5,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.update("j1", updateData);
    expect(job).toEqual({
      title: "j1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'j1'`
    );
    expect(result.rows).toEqual([
      {
        title: "j1",
        salary: 100,
        equity: 0.5,
        company_handle: "c1",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      salary: 100000,
      equity: 0.5,
      company_handle: null,
    };

    let job = await Job.update("c1", updateDataSetNulls);
    expect(job).toEqual({
      title: "j1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'j1'`
    );
    expect(result.rows).toEqual([
      {
        title: "j1",
        salary: 100000,
        equity: 0.5,
        company_handle: null,
        logo_url: null,
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("j1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("j1");
    const res = await db.query("SELECT title FROM jobs WHERE title='j1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
