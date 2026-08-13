/**
 * Parses page/limit query params into safe skip/limit values.
 */
function getPagination(query, { defaultLimit = 10, maxLimit = 50 } = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildPaginationMeta({ page, limit, totalCount }) {
  return {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 0,
    hasNextPage: page * limit < totalCount,
    hasPrevPage: page > 1,
  };
}

module.exports = { getPagination, buildPaginationMeta };
