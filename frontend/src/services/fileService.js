
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  
  if (process.env.NODE_ENV === 'development') {
    return `/${filePath}`;
  }
  
  
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'https://e-dami.snrt.ma';
  return `${serverUrl}/${filePath}`;
};


export const checkFileExists = async (filePath) => {
  try {
    const response = await fetch(getFileUrl(filePath), { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}; 