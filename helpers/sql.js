const { BadRequestError } = require("../expressError");


/**  Creating SQL query for fields for partial update.
 *
 * @param {obj, obj}
 *
 * dataToUpdate => {firstName: 'Aliya', age: 32}
 * jsToSql => {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        }
 *
 * dataToUpdate => req.body => {firstName, age} from Patch requests
 * jsToSql converts JS syntax to SQL syntax
 *
 * @returns {obj} =>
 * {setCols: ["name"=$1 "description"=2],
 * values: ["Aliya", "32"]}}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // keys = [name, description]
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
  `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
