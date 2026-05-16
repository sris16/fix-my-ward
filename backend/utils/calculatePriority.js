const calculatePriority = (upvotesCount, nearbyCount) => {
  const score = upvotesCount + nearbyCount;

  if (score >= 10) return "Critical";
  if (score >= 6) return "High";
  if (score >= 3) return "Medium";
  return "Low";
};

export default calculatePriority;