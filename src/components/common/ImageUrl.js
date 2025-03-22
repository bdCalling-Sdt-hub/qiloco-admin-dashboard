export const getImageUrl = (path) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  } else {
    const baseUrl = "http://10.0.60.126:6007";
    return `${baseUrl}/${path}`;
  }
};
