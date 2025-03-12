/**
 * Type definition for importing JSON files
 * 
 * @module json
 * @version 6.0.0 - Updated for major version release
 */

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '../package.json' {
  export const version: string;
} 