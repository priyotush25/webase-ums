
import jwt from "jsonwebtoken";

const generateToken = (userId, role, res) => {
    const token = jwt.sign(
        {
            id: userId.toString(),
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    res.cookie("ums_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
    });

    return token;
};

export default generateToken;
