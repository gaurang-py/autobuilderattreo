declare module 'canvas' {
  export class Canvas implements CanvasImageSource {
    width: number;
    height: number;
    getContext(contextId: '2d'): CanvasRenderingContext2D;
    toBuffer(): Buffer;
    toDataURL(type?: string, encoderOptions?: number): string;
  }
  
  export interface CanvasRenderingContext2D {
    canvas: Canvas;
    drawImage(image: any, dx: number, dy: number): void;
    drawImage(image: any, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: any, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
    // Add other methods as needed
  }
  
  export function createCanvas(width: number, height: number): Canvas;
  export function loadImage(src: string): Promise<any>;
} 