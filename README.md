# vite-plugin-wasm-rust

A lightweight wrapper for wasm-pack, designed to enhance the experience of building websites in rust.

## Features

- Supports Cargo workspaces
- Monitors files and directories for changes
- Rebuilds and reloads browser page upon file modifications
- Displays compilation errors directly in the browser
- Small, easy to read and modify

## Getting Started

Add vite.config.js to build and watch rust files in `src` dir

```js
import { defineConfig } from "vite";
import viteWasmPack from "vite-plugin-wasm-rust";

export default defineConfig(({ mode }) => {
  const release = mode != "development";
  return {
    root: ".",
    build: {
      target: "esnext",
    },
    server: {
      hmr: { overlay: true },
    },
    plugins: [
      viteWasmPack({
        build: {
          crate: "./",
          release: release,
          enable_opt: release,
        },
        watch: {
          include: ["./src/", "./styles"],
          exclude: ["./dist/**"],
        },
      }),
    ],
  };
});
```

add scripts to package.json

```json
{
  "scripts": {
    "dev": "vite -c vite.config.js",
    "build": "vite build -c vite.config.js"
  }
}
```

then run dev mode

```sh
npm run dev
```

## License

MIT or Apache 2.0
