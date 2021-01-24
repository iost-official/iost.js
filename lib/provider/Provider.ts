export default interface Provider {
  send(method: string, url: string, data?: string | {}): Promise<any>
}