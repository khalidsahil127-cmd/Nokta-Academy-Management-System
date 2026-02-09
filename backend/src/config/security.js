// src/config/security.js
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

exports.securityMiddleware = (app) => {
  // 1️⃣ Helmet – هدرهای امنیتی
  app.use(
    helmet({
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    })
  );

  // 2️⃣ CORS – دسترسی به API
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // موبایل اپ‌ها
        const allowedOrigins = ["https://nms.example.com"];
        if (!allowedOrigins.includes(origin)) {
          return callback(new Error("CORS not allowed"));
        }
        callback(null, true);
      },
      credentials: true
    })
  );

  //  Rate Limiter – محدودیت درخواست‌ها
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقیقه
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, try again later"
  });

  app.use("/api", limiter);
};
