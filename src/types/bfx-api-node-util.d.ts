declare module 'bfx-api-node-util' {
  export function genAuthSig(secret: string, payload?: string): { sig: string }
  export function nonce(): string
  export function isClass(fn: unknown): boolean

  const BfxUtil: {
    genAuthSig: typeof genAuthSig
    nonce: typeof nonce
    isClass: typeof isClass
  }
  export default BfxUtil
}
