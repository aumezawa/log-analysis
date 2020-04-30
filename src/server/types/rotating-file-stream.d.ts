import { Writable } from "stream";
export declare type Compressor = (source: string, dest: string) => string;
export declare type Generator = (time: number | Date, index?: number) => string;
export interface Options {
  compress?: boolean | string | Compressor;
  encoding?: string;
  history?: string;
  immutable?: boolean;
  initialRotation?: boolean;
  interval?: string;
  intervalBoundary?: boolean;
  maxFiles?: number;
  maxSize?: string;
  mode?: number;
  path?: string;
  rotate?: number;
  size?: string;
  teeToStdout?: boolean;
}
export declare class RotatingFileStream extends Writable {}
export declare function createStream(filename: string | Generator, options?: Options): RotatingFileStream;
