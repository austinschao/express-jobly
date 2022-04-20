"use strict"

const { sqlForPartialUpdate } = require("./sql")
const { BadRequestError } = require("../expressError")

describe("sqlForPartialUpdate", function () {
  test("works: valid data", function () {
    const dataToUpdate = {firstName: 'TestUpdate', lastName: 'TestUpdateLast'};
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({setCols:'"first_name"=$1, "last_name"=$2',
      values:['TestUpdate', 'TestUpdateLast']});
  });

  test("fails: no data", function () {
    const dataToUpdate = {};
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    try {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
      fail()
    } catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});