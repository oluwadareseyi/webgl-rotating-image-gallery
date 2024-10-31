import glsl from "vite-plugin-glsl";

export default {
  plugins: [glsl()],
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  envDir: "../",
};
