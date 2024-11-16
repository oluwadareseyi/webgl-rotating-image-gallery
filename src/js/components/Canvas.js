import { Renderer, Camera, Transform, Plane } from "ogl";
import Media from "./Media.js";
import NormalizeWheel from "normalize-wheel";
import { lerp } from "../utils/math";
import AutoBind from "../utils/bind";

export default class Canvas {
  constructor() {
    this.images = [
      "/img/11.webp",
      "/img/2.webp",
      "/img/3.webp",
      "/img/4.webp",
      "/img/5.webp",
      "/img/6.webp",
      "/img/7.webp",
      "/img/8.webp",
      "/img/9.webp",
      "/img/10.webp",
    ];

    this.scroll = {
      ease: 0.01,
      current: 0,
      target: 0,
      last: 0,
    };

    AutoBind(this);

    this.createRenderer();
    this.createCamera();
    this.createScene();

    this.onResize();

    this.createGeometry();
    this.createMedias();

    this.update();

    this.addEventListeners();
    this.createPreloader();
  }

  createPreloader() {
    Array.from(this.images).forEach((source) => {
      const image = new Image();

      this.loaded = 0;

      image.src = source;
      image.onload = (_) => {
        this.loaded += 1;

        if (this.loaded === this.images.length) {
          document.documentElement.classList.remove("loading");
          document.documentElement.classList.add("loaded");
        }
      };
    });
  }

  createRenderer() {
    this.renderer = new Renderer({
      canvas: document.querySelector("#gl"),
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });

    this.gl = this.renderer.gl;
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 1,
      widthSegments: 100,
    });
  }
  createMedias() {
    this.medias = this.images.map((image, index) => {
      return new Media({
        gl: this.gl,
        geometry: this.planeGeometry,
        scene: this.scene,
        renderer: this.renderer,
        screen: this.screen,
        viewport: this.viewport,
        image,
        length: this.images.length,
        index,
      });
    });
  }
  onResize() {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      height,
      width,
    };
    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({
          screen: this.screen,
          viewport: this.viewport,
        })
      );
    }
  }
  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  onTouchDown(event) {
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientY : event.clientY;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const y = event.touches ? event.touches[0].clientY : event.clientY;
    const distance = (this.start - y) * 0.1;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp(event) {
    this.isDown = false;
  }

  onWheel(event) {
    const normalized = NormalizeWheel(event);
    const speed = normalized.pixelY;

    this.scroll.target += speed * 0.005;
  }

  update() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    if (this.scroll.current > this.scroll.last) {
      this.direction = "up";
    } else {
      this.direction = "down";
    }

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, this.direction));
    }

    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    });

    this.scroll.last = this.scroll.current;

    window.requestAnimationFrame(this.update);
  }
  addEventListeners() {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("wheel", this.onWheel);
    window.addEventListener("mousewheel", this.onWheel);

    window.addEventListener("mousedown", this.onTouchDown);
    window.addEventListener("mousemove", this.onTouchMove);
    window.addEventListener("mouseup", this.onTouchUp);

    window.addEventListener("touchstart", this.onTouchDown);
    window.addEventListener("touchmove", this.onTouchMove);
    window.addEventListener("touchend", this.onTouchUp);
  }
}
