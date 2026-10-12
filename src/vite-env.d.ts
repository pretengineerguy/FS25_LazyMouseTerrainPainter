/// <reference types="vite/client" />

declare module '*.dds?url' {
  const src: string;
  export default src;
}

declare module '*.dds' {
  const src: string;
  export default src;
}

declare module '*.lua?raw' {
  const content: string;
  export default content;
}

declare module '*.xml?raw' {
  const content: string;
  export default content;
}
