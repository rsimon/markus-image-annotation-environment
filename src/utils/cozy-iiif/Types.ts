import type { Manifest, Canvas, ImageService2, ImageService3 } from '@iiif/presentation-3';

export type CozyParseResult = 
  | { type: 'manifest'; url: string, resource: CozyManifest }
  | { type: 'iiif-image'; url: string, resource: CozyImageResource }
  | { type: 'plain-image'; url: string }
  | { type: 'webpage'; url: string }
  | { 
      type: 'error';
      code: 'INVALID_URL' | 'FETCH_ERROR' | 'INVALID_MANIFEST' | 'UNSUPPORTED_FORMAT';
      message: string;
    };

export interface CozyManifest {

  readonly majorVersion: number;

  readonly source: Manifest;

  readonly id: string;

  readonly label: string;

  readonly canvases: CozyCanvas[];

}

export interface CozyCanvas {

  readonly source: Canvas;

  readonly id: string;

  readonly label: string;

  readonly width: number;

  readonly height: number;

  readonly images: CozyImageResource[];

}

export type CozyImageResource = 
  | StaticImageResource 
  | ImageServiceResource;

export type ImageServiceResource =
  | DynamicImageServiceResource
  | Level0ImageServiceResource;

interface BaseImageResource {

  type: 'static' | 'dynamic' | 'level0';

  width: number;

  height: number;

}

export interface StaticImageResource extends BaseImageResource {

  type: 'static';

  url: string;

}

export interface DynamicImageServiceResource extends BaseImageResource {

  type: 'dynamic';

  service: ImageService2 | ImageService3;

  serviceUrl: string;

  majorVersion: number;

}

export interface Level0ImageServiceResource extends BaseImageResource {

  type: 'level0';

  service: ImageService2 | ImageService3;

  serviceUrl: string;

}

export interface ImageRequestOptions {

  width?: number;

  height?: number;

  region?: 'full' | 'square' | { x: number; y: number; width: number; height: number };

  quality?: 'default' | 'color' | 'gray' | 'bitonal';

  format?: 'jpg' | 'png' | 'gif' | 'webp';

}

export interface Bounds {

  x: number;

  y: number;

  w: number;

  h: number;

}