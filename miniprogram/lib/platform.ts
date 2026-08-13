export interface PlatformResponse<T> {
  readonly data: T;
  readonly statusCode: number;
}

export interface PlatformRequest {
  readonly data?: unknown;
  readonly headers?: Readonly<Record<string, string>>;
  readonly method: "GET" | "POST" | "PUT";
  readonly redirect?: "follow" | "manual";
  readonly timeoutMilliseconds: number;
  readonly url: string;
}

export interface PlatformSelectedImage {
  readonly fileType: "image";
  readonly height: number;
  readonly size: number;
  readonly tempFilePath: string;
  readonly width: number;
}

export interface PlatformImageCompression {
  readonly compressedHeight: number;
  readonly compressedWidth: number;
  readonly quality: number;
  readonly sourcePath: string;
}

export interface PlatformImageInfo {
  readonly height: number;
  readonly orientation:
    | "down"
    | "down-mirrored"
    | "left"
    | "left-mirrored"
    | "right"
    | "right-mirrored"
    | "up"
    | "up-mirrored";
  readonly type: "gif" | "jpeg" | "png" | "tiff" | "unknown";
  readonly width: number;
}

export interface PlatformFileInfo {
  readonly sha256: string;
  readonly size: number;
}

export interface MiniProgramPlatform {
  chooseImage(): Promise<PlatformSelectedImage>;
  compressImage(request: PlatformImageCompression): Promise<string>;
  getFileInfo(filePath: string): Promise<PlatformFileInfo>;
  getImageInfo(filePath: string): Promise<PlatformImageInfo>;
  getStorage(key: string): unknown;
  login(timeoutMilliseconds: number): Promise<string>;
  randomBytes(length: number): Promise<Uint8Array>;
  readFile(filePath: string): Promise<ArrayBuffer>;
  removeSavedFile(filePath: string): Promise<void>;
  removeStorage(key: string): void;
  request<T>(request: PlatformRequest): Promise<PlatformResponse<T>>;
  saveFile(tempFilePath: string): Promise<string>;
  setStorage(key: string, value: string): void;
}

export function createWeChatPlatform(): MiniProgramPlatform {
  return {
    chooseImage: () =>
      new Promise((resolve, reject) => {
        wx.chooseMedia({
          count: 1,
          fail: (result) =>
            reject(
              new Error(
                result.errMsg.toLowerCase().includes("cancel")
                  ? "image_selection_cancelled"
                  : "image_selection_failed",
              ),
            ),
          mediaType: ["image"],
          sizeType: ["original"],
          sourceType: ["album", "camera"],
          success: (result) => {
            const file = result.tempFiles[0];
            if (file?.fileType !== "image") {
              reject(new Error("image_selection_failed"));
              return;
            }
            resolve({
              fileType: "image",
              height: file.height,
              size: file.size,
              tempFilePath: file.tempFilePath,
              width: file.width,
            });
          },
        });
      }),
    compressImage: (request) =>
      new Promise((resolve, reject) => {
        wx.compressImage({
          compressedHeight: request.compressedHeight,
          compressedWidth: request.compressedWidth,
          fail: () => reject(new Error("image_compression_failed")),
          quality: request.quality,
          src: request.sourcePath,
          success: (result) => resolve(result.tempFilePath),
        });
      }),
    getFileInfo: (filePath) =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().getFileInfo({
          digestAlgorithm: "sha256",
          fail: () => reject(new Error("image_file_info_failed")),
          filePath,
          success: (result) => resolve({ sha256: result.digest, size: result.size }),
        });
      }),
    getImageInfo: (filePath) =>
      new Promise((resolve, reject) => {
        wx.getImageInfo({
          fail: () => reject(new Error("image_info_failed")),
          src: filePath,
          success: (result) =>
            resolve({
              height: result.height,
              orientation: result.orientation,
              type: result.type,
              width: result.width,
            }),
        });
      }),
    getStorage: (key) => wx.getStorageSync(key),
    login: (timeoutMilliseconds) =>
      new Promise((resolve, reject) => {
        wx.login({
          fail: () => reject(new Error("wechat_login_failed")),
          success: (result) => resolve(result.code),
          timeout: timeoutMilliseconds,
        });
      }),
    randomBytes: (length) =>
      new Promise((resolve, reject) => {
        wx.getRandomValues({
          fail: () => reject(new Error("secure_random_failed")),
          length,
          success: (result) => resolve(new Uint8Array(result.randomValues)),
        });
      }),
    readFile: (filePath) =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          fail: () => reject(new Error("image_read_failed")),
          filePath,
          success: (result) =>
            result.data instanceof ArrayBuffer
              ? resolve(result.data)
              : reject(new Error("image_read_failed")),
        });
      }),
    removeSavedFile: (filePath) =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().removeSavedFile({
          fail: () => reject(new Error("image_saved_file_remove_failed")),
          filePath,
          success: () => resolve(),
        });
      }),
    removeStorage: (key) => wx.removeStorageSync(key),
    request: <T>(request: PlatformRequest) =>
      new Promise<PlatformResponse<T>>((resolve, reject) => {
        wx.request({
          ...(request.data === undefined
            ? {}
            : {
                data: request.data as ArrayBuffer | string | WechatMiniprogram.IAnyObject,
              }),
          fail: () => reject(new Error("request_failed")),
          ...(request.headers === undefined
            ? {}
            : { header: request.headers as WechatMiniprogram.IAnyObject }),
          method: request.method,
          ...(request.redirect === undefined ? {} : { redirect: request.redirect }),
          success: (response) =>
            resolve({ data: response.data as unknown as T, statusCode: response.statusCode }),
          timeout: request.timeoutMilliseconds,
          url: request.url,
        });
      }),
    saveFile: (tempFilePath) =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().saveFile({
          fail: () => reject(new Error("image_saved_file_failed")),
          tempFilePath,
          success: (result) => resolve(result.savedFilePath),
        });
      }),
    setStorage: (key, value) => wx.setStorageSync(key, value),
  };
}
