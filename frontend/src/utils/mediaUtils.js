const API_BASE_URL = 'http://localhost:5000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  return `${API_BASE_URL}${filePath}`;
};

export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
};

export const validateFileType = (file) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/avi',
    'video/x-avi',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  if (allowedMimes.includes(file.type)) {
    return true;
  }

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mts', 'm4v', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  const ext = file.name.toLowerCase().split('.').pop();
  return allowedExtensions.includes(ext);
};

export const getFileTypeCategory = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mts', 'm4v'];
  const ext = file.name.toLowerCase().split('.').pop();
  if (videoExtensions.includes(ext)) return 'video';
  
  return 'attachment';
};

export const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toUpperCase();
};

export const getFileSizeDisplay = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
