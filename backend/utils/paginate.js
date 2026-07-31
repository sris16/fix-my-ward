/**
 * 📊 Standardized Reusable Pagination Utility for MongoDB / Mongoose Queries
 */
export const getPaginationData = (queryParams, totalItems) => {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.max(1, parseInt(queryParams.limit, 10) || 10);
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    page,
    limit,
    skip,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
