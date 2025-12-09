import axios from 'axios';

// In development, the proxy handles the URL. In production, Nginx handles it.
const API_URL = ''; 

export const enhanceImage = async (file, settings) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('outscale', settings.outscale);
  formData.append('face_enhance', settings.face_enhance);
  formData.append('weight', settings.weight); // 0 to 1
  
  // Note: We use 'responseType: blob' because the server returns a PNG file
  const response = await axios.post(`${API_URL}/api/enhance`, formData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};