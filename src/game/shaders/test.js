export const test = `
precision mediump float;
 
varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;
uniform vec2 player;
uniform vec2 dimensions;

void main() {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
  gl_FragColor.r = 3.5 * gl_FragColor.r + player.x / dimensions.x;
  gl_FragColor.g = 1.0 * gl_FragColor.g + player.y / dimensions.y;
  gl_FragColor.b = 10.0 * gl_FragColor.b;
}
`;

// This can be used somehwere to run some shaders.
// They cant run from here.. this is just stashed
// const testSetup = () => {
//   const dimensions = new Float32Array(2);
//   dimensions[0] = this.sceneWidth;
//   dimensions[1] = this.sceneHeight;
//   this.globalFilter = new PIXI.Filter(undefined, test, {
//     player: new Float32Array(2),
//     dimensions,
//   });
// };
//
// const testUpdate = (player) => {
//   this.globalFilter.uniforms.player[0] =
//     player.position.x + this.sceneWidth / 2;
//   this.globalFilter.uniforms.player[1] =
//     player.position.y + this.sceneHeight / 2;
//   this.visible.filters = [this.globalFilter];
// };
