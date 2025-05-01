/// <reference types="vite/client" />

declare module '@twa-dev/sdk' {
  const WebApp: {
    ready(): void;
    showAlert(message: string): void;
    // Add other methods as needed
  };

  export default WebApp;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.png' {
  const content: string;
  export default content;
}