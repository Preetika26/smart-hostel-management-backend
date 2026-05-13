const path = require("path");
const { getImageKit } = require("../config/imagekit");

const sanitizeFileName = (name = "file") =>
  name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");

const uploadBufferToImageKit = async ({ file, folder = "/smart-hostel" }) => {
  if (!file?.buffer) {
    return null;
  }

  const baseName = path.parse(file.originalname || "file").name;
  const extension = path.extname(file.originalname || "");
  const fileName = `${Date.now()}-${sanitizeFileName(baseName)}${extension}`;
  const imagekit = getImageKit();

  const uploaded = await imagekit.upload({
    file: file.buffer,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: uploaded.url,
    fileId: uploaded.fileId,
    name: uploaded.name,
  };
};

module.exports = { uploadBufferToImageKit };
