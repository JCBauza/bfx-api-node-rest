declare module 'bfx-api-mock-srv' {
  export class MockRESTv2Server {
    constructor(opts?: { listen?: boolean })
    setResponse(key: string, data: unknown[] | unknown[][]): void
    listen(): void
    close(): Promise<void> | void
  }

  const MockSrv: {
    MockRESTv2Server: typeof MockRESTv2Server
  }
  export default MockSrv
}
