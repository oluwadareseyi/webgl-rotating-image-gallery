import glsl from "vite-plugin-glsl";

export default {
  plugins: [glsl()],
  root: "src",
  base: "/helix-effect/",
  build: {
    outDir: "../dist/helix-effect",
    assetsDir: "files",
    emptyOutDir: true,
  },
  envDir: "../",
};
