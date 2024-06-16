import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // import file System used to manage file system
// import { ApiError } from "./ApiError.util";

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
      resource_type: "image" || "video",
    });
    // File has been uploaded successfully
    console.log(
      "File has been successfully uploaded on cloudinary",
      response.url
    );
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Remove the locally saved temporary file as the upload operation got failed
    console.log("Error in uploading Files", error);
  }
};

const deleteOldImage = async (oldImagePath) => {
  if (!oldImagePath) {
    return null;
  }
  try {
    // console.log("> cloudinary : OldImagePath: " + oldImagePath);

    // Remove the file extension (e.g., '.jpg') from the URL
    const imageUrlWithoutExtension = oldImagePath.slice(
      0,
      oldImagePath.lastIndexOf(".")
    );

    // Extract the public ID from the URL
    const publicId = imageUrlWithoutExtension.split("/").pop();
    console.log("Public ID:", publicId);

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image" || "video",
      invalidate: true,
    });
    console.log(response.result); // Logs the result of the deletion operation
  } catch (error) {
    console.log("Error in deleting old avatar image:", error.message);
  }
};

export { uploadOnCloudinary, deleteOldImage };
