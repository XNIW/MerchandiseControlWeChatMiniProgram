const filenamePattern = /^mc-product-image-[0-9a-f]{32}\.jpg$/;

export function isOwnedImageFile(path: string): boolean {
  const prefix = `${wx.env.USER_DATA_PATH}/`;
  return path.startsWith(prefix) && filenamePattern.test(path.slice(prefix.length));
}

export function unlinkOwnedImage(path: string): Promise<void> {
  if (!isOwnedImageFile(path)) return Promise.reject(new Error("image_file_scope_invalid"));
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().unlink({
      filePath: path,
      success: () => resolve(),
      fail: () => reject(new Error("image_file_remove_failed")),
    });
  });
}

export async function writeOwnedImage(bytes: ArrayBuffer): Promise<string> {
  const suffix = await new Promise<string>((resolve, reject) => {
    wx.getRandomValues({
      length: 16,
      success: (result) =>
        resolve(
          Array.from(new Uint8Array(result.randomValues), (b) =>
            b.toString(16).padStart(2, "0"),
          ).join(""),
        ),
      fail: () => reject(new Error("secure_random_failed")),
    });
  });
  const path = `${wx.env.USER_DATA_PATH}/mc-product-image-${suffix}.jpg`;
  try {
    await new Promise<void>((resolve, reject) => {
      wx.getFileSystemManager().writeFile({
        filePath: path,
        data: bytes,
        success: () => resolve(),
        fail: () => reject(new Error("image_file_write_failed")),
      });
    });
    return path;
  } catch (error) {
    await unlinkOwnedImage(path).catch(() => undefined);
    throw error;
  }
}

// Run once before any new preparation. Only this exact namespace is swept;
// confirmed journal references, native temporary files and other app files stay.
export async function cleanOwnedImages(retained: readonly string[]): Promise<void> {
  const files = await new Promise<string[]>((resolve, reject) => {
    wx.getFileSystemManager().readdir({
      dirPath: wx.env.USER_DATA_PATH,
      success: (result) => resolve(result.files),
      fail: () => reject(new Error("image_file_list_failed")),
    });
  });
  const keep = new Set(retained);
  for (const file of files) {
    const path = `${wx.env.USER_DATA_PATH}/${file}`;
    if (filenamePattern.test(file) && !keep.has(path)) await unlinkOwnedImage(path);
  }
}
