const fetch = require("node-fetch");
const User = require("../models/user.schema");

const LARAVEL_BACKEND_URL =
  process.env.LARAVEL_BACKEND_URL || "http://10.10.253.3:8000";

async function validateSanctumToken(req, res, next) {
  const header = req.headers && req.headers.authorization;
  const cookieToken = req.cookies && req.cookies.erp_token;
  const queryToken = req.query && req.query.token;
  const token =
    header && header.startsWith("Bearer ")
      ? header.split(" ")[1]
      : cookieToken || queryToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const response = await fetch(`${LARAVEL_BACKEND_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const laravelUser = await response.json();
    req.user = laravelUser;
    console.log("laravelUser", { name: laravelUser.name, role: laravelUser.role, department: laravelUser.department.name });


    // AUTO-SYNC: ensure a corresponding Mongo User exists and is up to date
    const mappedRole =
      typeof laravelUser.role === "string" &&
        laravelUser.role.toLowerCase().includes("admin")
        ? "admin"
        : "user";

    let mongoUser = await User.findOne({
      $or: [{ email: laravelUser.email }, { laravel_id: laravelUser.id }],
    });

    if (!mongoUser) {
      // Derive a base username from email or name
      const baseFromEmail =
        (laravelUser.email && laravelUser.email.split("@")[0]) || "";
      const baseFromName =
        (laravelUser.name &&
          laravelUser.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ".")
            .replace(/[^a-z0-9_.-]/g, "")) ||
        "";
      const baseUsername =
        baseFromEmail || baseFromName || `user${laravelUser.id || ""}` || "user";

      // Try a few times in case of concurrent requests creating the same username
      let attempt = 0;
      let created = false;

      while (!created && attempt < 5) {
        const suffix =
          attempt === 0 ? "" : `${attempt}${Math.floor(Math.random() * 1000)}`;
        const username = `${baseUsername}${suffix}`;

        try {
          mongoUser = await User.create({
            username,
            email: laravelUser.email,
            laravel_id: laravelUser.id,
            department:
              laravelUser.department?.name || laravelUser.department || null,
            displayName: laravelUser.name || "",
            phone: laravelUser.phone || null,
            avatar: laravelUser.profile_photo_url || null,
            role: mappedRole,
          });
          created = true;
        
        } catch (createErr) {
          // Duplicate username from concurrent requests – try again with a new suffix
          if (
            createErr &&
            createErr.code === 11000 &&
            createErr.keyPattern &&
            createErr.keyPattern.username
          ) {
            attempt += 1;
            continue;
          }
          throw createErr;
        }
      }

      if (!created || !mongoUser) {
        throw new Error("Failed to create synced user after multiple attempts");
      }
    } else {
      // Update existing user with latest data from Laravel
      mongoUser.displayName = laravelUser.name || mongoUser.displayName;
      mongoUser.phone = laravelUser.phone || mongoUser.phone;
      mongoUser.role = mappedRole;
      mongoUser.laravel_id = laravelUser.id;
      mongoUser.department =
        laravelUser.department?.name ||
        laravelUser.department ||
        mongoUser.department;
      mongoUser.avatar =
        laravelUser.profile_photo_url || mongoUser.avatar || null;
      await mongoUser.save();
    }

    // Make Mongo user id available to downstream handlers (chats, messages, etc.)
    req.userId = mongoUser._id.toString();

    next();
  } catch (err) {
    console.error("validateSanctumToken error:", err);
    return res.status(500).json({ message: "Token validation failed" });
  }
}

module.exports = validateSanctumToken;
