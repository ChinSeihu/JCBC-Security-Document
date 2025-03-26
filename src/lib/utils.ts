export const formatFileSize = (size: number) => {
  const kb = size / 1024
  
  if (kb < 1024) return kb + 'KB';

  const mb = kb / 1024;
  return mb + 'MB';
}