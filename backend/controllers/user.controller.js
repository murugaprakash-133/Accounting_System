import User from "../models/user.model.js";

export const getUserForProfile = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find user by ID excluding password and other sensitive information
        const user = await User.findById(loggedInUserId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user); // Send back the user details without password

    } catch (error) {
        console.error("Error in getUserForSideBar controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
