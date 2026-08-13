import type {
  MiniProgramPlatform,
  PlatformFileInfo,
  PlatformImageCompression,
  PlatformImageInfo,
  PlatformRequest,
  PlatformResponse,
  PlatformSelectedImage,
} from "../miniprogram/lib/platform";

export class FakePlatform implements MiniProgramPlatform {
  readonly compressionRequests: PlatformImageCompression[] = [];
  readonly fileBytes = new Map<string, ArrayBuffer>();
  readonly fileInfos = new Map<string, PlatformFileInfo>();
  readonly imageInfos = new Map<string, PlatformImageInfo>();
  readonly requests: PlatformRequest[] = [];
  readonly removedSavedFiles: string[] = [];
  readonly storage = new Map<string, unknown>();
  chooseImageCalls = 0;
  chooseImageFails = false;
  compressedImagePaths: string[] = [];
  loginCode = "temporary-code";
  loginFails = false;
  queuedResponses: Array<Error | PlatformResponse<unknown>> = [];
  selectedImage: PlatformSelectedImage | null = null;
  savedFileCount = 0;

  async chooseImage(): Promise<PlatformSelectedImage> {
    this.chooseImageCalls += 1;
    if (this.chooseImageFails) throw new Error("image_selection_cancelled");
    if (this.selectedImage === null) throw new Error("no_fake_image");
    return this.selectedImage;
  }

  async compressImage(request: PlatformImageCompression): Promise<string> {
    this.compressionRequests.push(request);
    const filePath = this.compressedImagePaths.shift();
    if (filePath === undefined) throw new Error("no_fake_compressed_image");
    return filePath;
  }

  async getFileInfo(filePath: string): Promise<PlatformFileInfo> {
    const info = this.fileInfos.get(filePath);
    if (info === undefined) throw new Error("no_fake_file_info");
    return info;
  }

  async getImageInfo(filePath: string): Promise<PlatformImageInfo> {
    const info = this.imageInfos.get(filePath);
    if (info === undefined) throw new Error("no_fake_image_info");
    return info;
  }

  getStorage(key: string): unknown {
    return this.storage.get(key);
  }

  async login(_timeoutMilliseconds: number): Promise<string> {
    if (this.loginFails) throw new Error("cancelled");
    return this.loginCode;
  }

  async randomBytes(length: number): Promise<Uint8Array> {
    return Uint8Array.from({ length }, (_, index) => (index * 17 + 3) % 256);
  }

  async readFile(filePath: string): Promise<ArrayBuffer> {
    const bytes = this.fileBytes.get(filePath);
    if (bytes === undefined) throw new Error("no_fake_file_bytes");
    return bytes.slice(0);
  }

  async removeSavedFile(filePath: string): Promise<void> {
    this.removedSavedFiles.push(filePath);
    this.fileBytes.delete(filePath);
    this.fileInfos.delete(filePath);
    this.imageInfos.delete(filePath);
  }

  removeStorage(key: string): void {
    this.storage.delete(key);
  }

  async request<T>(request: PlatformRequest): Promise<PlatformResponse<T>> {
    this.requests.push(request);
    const response = this.queuedResponses.shift();
    if (!response) throw new Error("no_fake_response");
    if (response instanceof Error) throw response;
    return response as PlatformResponse<T>;
  }

  async saveFile(tempFilePath: string): Promise<string> {
    const bytes = this.fileBytes.get(tempFilePath);
    const fileInfo = this.fileInfos.get(tempFilePath);
    const imageInfo = this.imageInfos.get(tempFilePath);
    if (bytes === undefined || fileInfo === undefined || imageInfo === undefined) {
      throw new Error("no_fake_saved_file_source");
    }
    this.savedFileCount += 1;
    const savedPath = `/saved/image-${this.savedFileCount}.jpg`;
    this.fileBytes.set(savedPath, bytes.slice(0));
    this.fileInfos.set(savedPath, { ...fileInfo });
    this.imageInfos.set(savedPath, { ...imageInfo });
    return savedPath;
  }

  setStorage(key: string, value: string): void {
    this.storage.set(key, value);
  }
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

export async function expectReject(
  operation: () => Promise<unknown>,
  predicate: (error: unknown) => boolean,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    assert(predicate(error), "rejection did not match the expected error");
    return;
  }
  throw new Error("operation unexpectedly resolved");
}
