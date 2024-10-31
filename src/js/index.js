import Lenis from "lenis";

import Canvas from "./components/Canvas";

export default class App {
  constructor(options) {
    this.lenis = new Lenis();
    this.lenis.on("scroll", (e) => {});
    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    this.gl = new Canvas();
    this.lenis.on("scroll", (e) => {
      this.gl.onScroll(e);
    });
  }
}
window.addEventListener("load", () => {
  new App();
});
