import dotenv from "dotenv";

dotenv.config();

const envConfig = Object.freeze({
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [process.env.CLIENT_URL || "http://localhost:3000"],
  JWT_SECRET: process.env.JWT_SECRET,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
});

export default envConfig;
