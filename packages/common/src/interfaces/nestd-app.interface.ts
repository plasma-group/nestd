export interface INestdApp {
  /**
   * Starts the application.
   */
  start(): Promise<void>

  /**
   * Stops the application.
   */
  stop(): Promise<void>
}
