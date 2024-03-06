const { v4: uuid } = require("uuid");

const fileRename = (thumbnail) => {
  let fileName = thumbnail.name;
  const splittedFileName = fileName.split(".");
  let newFileName =
    splittedFileName[0] +
    uuid() +
    "." +
    splittedFileName[splittedFileName.length - 1];

  return newFileName;
};

module.exports = fileRename;
