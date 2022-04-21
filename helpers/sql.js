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
 * {setCols:'"name"=$1, "description"=$2',
      values:['Aliya', '32']}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // keys = [name, description]
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['first_name=$1', 'age=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Creating SQL query for fields for filtering
 * @param {obj}
 *
 * dataToFilter => {name: "net", minEmployees: 1, maxEmployees: 3}
 * jsToSql => {minEmployees: "min_employees", maxEmployees: "max_employees"}
 *
 * @returns {obj}
 * {filterCols:'"name"=$1, "min_employees"=$2, "max_employees"=$3',
      values:['net', 1, 3]}
 */

function sqlForFiltering(dataToFilter, jsToSql) {
  const symbols = { name: "ILIKE", minEmployees: ">=", maxEmployees: "<=" };
  const keys = Object.keys(dataToFilter);

  if (keys.length === 0) throw new BadRequestError("No data");
  const values = Object.values(dataToFilter);

  const cols = keys.map(function (colName, idx) {
    if (colName === "name") {
      values[idx] = `%${values[idx]}%`; //reassigning to modify to "%net%"
      return `${colName} ILIKE $${idx + 1}`;
    } else {
      return `${jsToSql[colName]} ${symbols[colName]} $${idx + 1}`;
    }
  });
  return {
    filterCols: cols.join(" AND "),
    values,
  };
}

module.exports = { sqlForPartialUpdate, sqlForFiltering };
