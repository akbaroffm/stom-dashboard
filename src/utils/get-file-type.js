const getFileType = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];

  if (imageExtensions.includes(extension)) {
    return "image";
  } else if (extension === "pdf") {
    return "pdf";
  } else if (["doc", "docx", "txt", "xls", "xlsx"].includes(extension)) {
    return "document";
  }
  return "other";
};
export default getFileType;
