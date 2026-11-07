// Small helpers shared by the route files.

// Stop the request and send an error to the browser:  throw httpError(400, 'Name is required');
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Read a numeric id from the URL (/medicines/5) and reject anything else.
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw httpError(400, 'Invalid id.');
  return id;
}

module.exports = { httpError, parseId };
