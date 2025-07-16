// Service pour gérer les URLs des fichiers uploadés
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // En développement, utiliser localhost:5000
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5000/${filePath}`;
  }
  
  // En production, utiliser l'URL du serveur
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'https://e-dami.snrt.ma';
  return `${serverUrl}/${filePath}`;
};

// Fonction pour vérifier si un fichier existe
export const checkFileExists = async (filePath) => {
  try {
    const response = await fetch(getFileUrl(filePath), { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}; 