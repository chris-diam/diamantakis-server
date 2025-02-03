// server.js
import app from "./src/app.js";
import config from "./src/config/env.js";
import connectDB from "./src/config/database.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

// Start server
const server = app.listen(config.port, () => {
  console.log(
    `Server running in ${config.nodeEnv} mode on port ${config.port}`
  );
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
