const User = require("../../models/user.schema");
const bcrypt = require("bcryptjs");

async function getAllUsersAdmin(req, res) {
    try {
        const users = await User.find({}).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Admin get all users error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getUserByIdAdmin(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Admin get user by ID error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function createUserAdmin(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).json({ message: "User created successfully", user: user.toObject({ getters: true, virtuals: false, transform: (doc, ret) => { delete ret.password; return ret; } }) });
    } catch (error) {
        console.error("Admin create user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function updateUserAdmin(req, res) {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ message: "User updated successfully", user: user.toObject({ getters: true, virtuals: false, transform: (doc, ret) => { delete ret.password; return ret; } }) });
    } catch (error) {
        console.error("Admin update user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteUserAdmin(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Admin delete user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getAllUsersAdmin,
    getUserByIdAdmin,
    createUserAdmin,
    updateUserAdmin,
    deleteUserAdmin,
};