declare module 'colorthief' {
  import { Canvas } from 'canvas';
  
  export default class ColorThief {
    getColor(img: HTMLImageElement | CanvasImageSource | Canvas): [number, number, number];
    getPalette(img: HTMLImageElement | CanvasImageSource | Canvas, colorCount?: number): Array<[number, number, number]>;
  }
} 