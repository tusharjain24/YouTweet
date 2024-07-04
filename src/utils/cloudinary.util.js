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

    // Determine resource type based on file extension
    const fileExtension = localFilePath.split(".").pop().toLowerCase();
    const resourceType = fileExtension === "mp4" ? "video" : "image";

    // Upload on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
    });

    // File has been uploaded successfully
    console.log(
      "File has been successfully uploaded on Cloudinary",
      response.url
    );

    fs.unlinkSync(localFilePath); // Remove the local file
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Remove the local file if upload fails
    }
    console.log("Error in uploading files:", error);
    throw error; // Rethrow the error to handle it upstream
  }
};

const deleteOldMedia = async (oldMediaPath) => {
  if (!oldMediaPath) return null;

  try {
    // Extract the file extension to determine resource type
    const fileExtension = oldMediaPath.split(".").pop().toLowerCase();
    const resourceType = fileExtension === "mp4" ? "video" : "image";

    // Remove the file extension (e.g., '.jpg') from the URL
    const mediaUrlWithoutExtension = oldMediaPath.slice(
      0,
      oldMediaPath.lastIndexOf(".")
    );

    // Extract the public ID from the URL
    const publicId = mediaUrlWithoutExtension.split("/").pop();
    console.log("Public ID:", publicId);

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    console.log("Response on deleting the media: ", response.result); // Logs the result of the deletion operation
    return response;
  } catch (error) {
    console.log("Error in deleting old media:", error.message);
    throw error; // Rethrow the error to handle it upstream
  }
};

export { uploadOnCloudinary, deleteOldMedia };
