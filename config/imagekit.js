const ImageKit = require("imagekit");

const requiredImageKitVars = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
];

const getImageKit = () => {
  const missingImageKitVars = requiredImageKitVars.filter((key) => !process.env[key]);

  if (missingImageKitVars.length > 0) {
    throw new Error(
      `ImageKit not configured. Missing env vars: ${missingImageKitVars.join(", ")}`
    );
  }

  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
};

module.exports = { getImageKit };
