const bcrypt = require("bcryptjs");
const User = require("../../models/user.schema");
const jwt = require("jsonwebtoken");

async function createUser(req, res) {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Don't send password back
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,                                  // Prevents XSS (JavaScript access)
      secure: false,   // Only sends over HTTPS                            // Protects against CSRF
      maxAge: 3600000,                                // 1 hour in milliseconds
      path: "/",                                      // Ensures cookie is available on all routes
    });
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    return res
      .status(200)
      .json({ message: "Login successful", user: userResponse });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function isAuthenticated(req, res) {
  try {
    return res.status(200).json({ message: "Authenticated" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllusers(req, res) {
  try {
    // Get query parameters for pagination/filtering
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Logged-in user ID
    const currentUserId = req.userId;

    // Base filter: exclude logged-in user
    let filter = {
      _id: { $ne: currentUserId },
    };
    if (search) {
      // Combine exclusion with search using $and
      filter = {
        $and: [
          { _id: { $ne: currentUserId } },
          {
            $or: [
              { username: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { displayName: { $regex: search, $options: "i" } },
            ],
          },
        ],
      };
    }
    // Get users with pagination
    const users = await User.find(filter)
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const userData = await User.findById(id).select("-password");

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createUser, getAllusers, getUserById, loginUser, isAuthenticated };
