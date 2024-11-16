import { Mesh, Program, Texture } from "ogl";
import vertex from "../../shaders/vertex.glsl";
import fragment from "../../shaders/fragment.glsl";
import { map } from "../utils/math";

export default class Media {
  constructor({
    gl,
    geometry,
    scene,
    renderer,
    screen,
    viewport,
    image,
    length,
    index,
  }) {
    this.extra = 0;

    this.gl = gl;
    this.geometry = geometry;
    this.scene = scene;
    this.renderer = renderer;
    this.screen = screen;
    this.viewport = viewport;
    this.image = image;
    this.length = length;
    this.index = index;

    this.createShader();
    this.createMesh();

    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: false,
    });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      fragment,
      vertex,
      uniforms: {
        tMap: { value: texture },
        uPosition: { value: 0 },
        uPlaneSize: { value: [0, 0] },
        uImageSize: { value: [0, 0] },
        uSpeed: { value: 0 },
        uAxis: { value: [0, 1, 0] },
        uAxis2: { value: [1, 1, 0] },
        uDistortion: { value: 3 },
        uViewportSize: { value: [this.viewport.width, this.viewport.height] },
        uTime: { value: 0 },
      },
      cullFace: false,
    });

    const image = new Image();

    image.src = this.image;
    image.onload = (_) => {
      texture.image = image;

      this.program.uniforms.uImageSize.value = [
        image.naturalWidth,
        image.naturalHeight,
      ];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });

    this.plane.setParent(this.scene);
  }

  setScale(x, y) {
    x = 320;
    y = 300;
    this.plane.scale.x = (this.viewport.width * x) / this.screen.width;
    this.plane.scale.y = (this.viewport.height * y) / this.screen.height;

    this.plane.program.uniforms.uPlaneSize.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
  }
  setX() {
    this.plane.position.x =
      -(this.viewport.width / 2) + this.plane.scale.x / 2 + this.x;
  }

  onResize({ screen, viewport } = {}) {
    if (screen) {
      this.screen = screen;
    }

    if (viewport) {
      this.viewport = viewport;
      this.plane.program.uniforms.uViewportSize.value = [
        this.viewport.width,
        this.viewport.height,
      ];
    }
    this.setScale();

    this.padding = 0.8;
    this.height = this.plane.scale.y + this.padding;

    this.heightTotal = this.height * this.length;

    this.y = this.height * this.index;
  }

  update(scroll, direction) {
    this.plane.position.y = this.y - scroll.current - this.extra;

    // map position from 5 to 15 depending on the scroll position
    const position = map(
      this.plane.position.y,
      -this.viewport.height,
      this.viewport.height,
      5,
      15
    );

    this.program.uniforms.uPosition.value = position;

    this.speed = scroll.current - scroll.last;

    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = scroll.current;

    const planeOffset = this.plane.scale.y / 2;
    const viewportOffset = this.viewport.height;

    this.isBefore = this.plane.position.y + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.y - planeOffset > viewportOffset;

    if (direction === "up" && this.isBefore) {
      this.extra -= this.heightTotal;

      this.isBefore = false;
      this.isAfter = false;
    }

    if (direction === "down" && this.isAfter) {
      this.extra += this.heightTotal;

      this.isBefore = false;
      this.isAfter = false;
    }
  }
}
