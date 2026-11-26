import axios from "axios";
import FormData from "form-data";

const uploadToImgBB = async (file) => {
    try {
        if (!process.env.IMGBB_API_KEY) {
            throw new Error("ImgBB API key is missing.");
        }

        const formData = new FormData();

        formData.append("image", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            formData,
            {
                headers: formData.getHeaders(),
                maxBodyLength: 5 * 1024 * 1024
            }
        );

        return response.data.data.url;

    } catch (error) {
        console.error(
            "ImgBB Upload Error:",
            error.response?.data || error.message
        );

        throw new Error("Profile image upload failed.");
    }
};

export default uploadToImgBB;