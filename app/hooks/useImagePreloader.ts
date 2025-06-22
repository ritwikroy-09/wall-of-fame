export const useImagePreloader = (imageUrls: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    let loadedImages = 0;
    const totalImages = imageUrls.length;

    if (totalImages === 0) {
      resolve(true);
      return;
    }

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          resolve(true);
        }
      };
    });
  });
};

export default useImagePreloader;
