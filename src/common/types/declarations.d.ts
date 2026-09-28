declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
    layout?: 'portrait' | 'landscape';
    info?: Record<string, any>;
    bufferPages?: boolean;
    autoFirstPage?: boolean;
  }

  class PDFDocumentInstance implements NodeJS.ReadableStream {
    readable: boolean;
    y: number;
    x: number;
    page: any;

    constructor(options?: PDFDocumentOptions);

    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;

    fillColor(color: string): this;
    strokeColor(color: string): this;
    lineWidth(width: number): this;
    fontSize(size: number): this;
    font(src: string): this;
    text(text: string, options?: any): this;
    text(text: string, x?: number, y?: number, options?: any): this;
    moveDown(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    image(src: any, x?: number, y?: number, options?: any): this;
    image(src: any, options?: any): this;
    end(): void;

    read(size?: number): string | Buffer;
    pause(): this;
    resume(): this;
    isPaused(): boolean;
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean }): T;
    unpipe(destination?: NodeJS.WritableStream): this;
    unshift(chunk: string | Buffer | Uint8Array, encoding?: BufferEncoding): void;
    wrap(oldStream: NodeJS.ReadableStream): this;
    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  }

  const PDFDocument: typeof PDFDocumentInstance;
  export default PDFDocument;
}

declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    type?: string;
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
    quality?: number;
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toDataURL(
    text: string | QRCodeSegment[],
    options?: QRCodeToDataURLOptions,
  ): Promise<string>;

  export function toDataURL(
    text: string | QRCodeSegment[],
    callback: (error: Error | null, url: string) => void,
  ): void;

  export interface QRCodeSegment {
    data: string;
    mode?: string;
  }

  const qrcode: {
    toDataURL: typeof toDataURL;
    [key: string]: any;
  };

  export default qrcode;
}
