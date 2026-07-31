/**
 * 🔒 Environment variable verification on startup
 */
export const validateEnv = () => {
  const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET"];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ CRITICAL: Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log("✅ Environment configuration validated.");
};
