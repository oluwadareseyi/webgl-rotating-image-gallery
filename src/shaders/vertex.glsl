precision highp float;
 
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
 
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float uPosition;
uniform float uTime;
uniform float uSpeed;
uniform vec3 uAxis;
uniform vec3 uAxis2;
uniform float uDistortion;
 
varying vec2 vUv;
varying vec3 vNormal;


float PI = 3.141592653589793238;
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}
float qinticInOut(float t) {
  return t < 0.5
    ? +16.0 * pow(t, 5.0)
    : -0.5 * abs(pow(2.0 * t - 2.0, 5.0)) + 1.0;
}

 
void main() {
  vUv = uv;

  float norm = 0.5;
  
  vec3 newpos = position;
  float offset = ( dot(uAxis2,position) +norm/2.)/norm;

  float localprogress = clamp( (fract(uPosition * 5.0 * 0.01) - 0.01*uDistortion*offset)/(1. - 0.01*uDistortion),0.,2.); 

  localprogress = qinticInOut(localprogress)*PI;

  newpos = rotate(newpos,uAxis,localprogress);
 
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}