export interface INesdApplication {
  /**
   * Starts the application.
   */
  start(): Promise<void>

  /**
   * Stops the application.
   */
  stop(): Promise<void>
}
