"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSchema = require("../schemas/jobFilter.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: isAdmin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * -title: case-insensitive, matches-any-part-of-string search.
 * -minSalary: filter to jobs with at least that salary.
 * -hasEquity: if true, filter to jobs that provide a non-zero amount of equity.
 * If false or not included in the filtering, list all jobs regardless of equity.
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  // const rQuery = { ...req.query };
  // if (Object.keys(rQuery).length) {
  //   if (rQuery.minEmployees) {
  //     rQuery.minEmployees = parseInt(rQuery.minEmployees);
  //   }
  //   if (rQuery.maxEmployees) {
  //     rQuery.maxEmployees = parseInt(rQuery.maxEmployees);
  //   }
  //   const validator = jsonschema.validate(rQuery, companyFilterSchema);
  //   if (!validator.valid) {
  //     const errs = validator.errors.map((e) => e.stack);
  //     throw new BadRequestError(errs);
  //   } else {
  //     const jobs = await Company.findFiltered(rQuery);
  //     return res.json({ jobs });
  //   }
  // }
  const jobs = await Job.findAll();
  return res.json({ jobs });
});

/** GET /[id]  =>  { job }
 *
 *  Job is { title, salary, equity, company_handle}
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[job] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle}
 *
 * Authorization required: isAdmin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: isAdmin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});

module.exports = router;
