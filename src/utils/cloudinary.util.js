import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // import file System used to manage file system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File has been uploaded successfully
    fs.unlinkSync(localFilePath);
    console.log(
      "File has been successfully uploaded on cloudinary",
      response.url
    );
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Remove the locally saved temporary file as the upload operation got failed
    console.log("Error in uploading Files", error);
  }
};

export { uploadOnCloudinary };
