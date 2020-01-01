export const blackBorderFilter = `
precision mediump float;
 
varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;


void main() {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
  gl_FragColor.r = 1.0;

  if (vTextureCoord.x < 0.1) {
    gl_FragColor.r = 1.0;
  }
  
  if (gl_FragColor.r == 0.0 && gl_FragColor.g == 0.0 && gl_FragColor.b == 0.0) {
    gl_FragColor.r = gl_FragColor.r;
  }
}
`;
