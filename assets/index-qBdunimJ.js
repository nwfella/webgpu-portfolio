(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();class U{device=null;adapter=null;canvas=null;context=null;format="bgra8unorm";constructor(){}static async create(t){const e=new U;e.canvas=t;const r=navigator.gpu;if(!r)throw new Error("WebGPU not available");if(e.adapter=await r.requestAdapter({powerPreference:"high-performance"}),!e.adapter)throw new Error("No WebGPU adapter found");return e.device=await e.adapter.requestDevice(),e.format=r.getPreferredCanvasFormat(),e.context=t.getContext("webgpu"),e.context.configure({device:e.device,format:e.format,alphaMode:"premultiplied"}),e}resize(){if(!this.canvas||!this.context)return;const t=window.devicePixelRatio||1,e=Math.floor(this.canvas.clientWidth*t),r=Math.floor(this.canvas.clientHeight*t);(this.canvas.width!==e||this.canvas.height!==r)&&(this.canvas.width=e,this.canvas.height=r,this.context.configure({device:this.device,format:this.format,alphaMode:"premultiplied"}))}get width(){return this.canvas?.width??1}get height(){return this.canvas?.height??1}get aspect(){return this.width/this.height}}class V{lastTime=0;delta=0;elapsed=0;frameCount=0;tick(){const t=performance.now()/1e3;this.lastTime===0&&(this.lastTime=t),this.delta=Math.min(t-this.lastTime,.1),this.lastTime=t,this.elapsed+=this.delta,this.frameCount++}}class _{_x=0;_y=0;_prevX=0;_prevY=0;_down=!1;_justPressed=!1;_scroll=0;_prevScroll=0;onMouseMove=t=>{this._prevX=this._x,this._prevY=this._y,this._x=t.clientX,this._y=t.clientY};onMouseDown=()=>{this._down=!0,this._justPressed=!0};onMouseUp=()=>{this._down=!1};onWheel=t=>{this._scroll+=t.deltaY*.001};onTouchMove=t=>{if(t.touches.length===0)return;const e=t.touches[0];this._prevX=this._x,this._prevY=this._y,this._x=e.clientX,this._y=e.clientY};onTouchStart=t=>{if(t.touches.length===0)return;this._down=!0,this._justPressed=!0;const e=t.touches[0];this._x=e.clientX,this._y=e.clientY,this._prevX=this._x,this._prevY=this._y};onTouchEnd=()=>{this._down=!1};attach(t){t.addEventListener("mousemove",this.onMouseMove),t.addEventListener("mousedown",this.onMouseDown),t.addEventListener("mouseup",this.onMouseUp),t.addEventListener("wheel",this.onWheel,{passive:!0}),t.addEventListener("touchmove",this.onTouchMove,{passive:!0}),t.addEventListener("touchstart",this.onTouchStart,{passive:!0}),t.addEventListener("touchend",this.onTouchEnd)}detach(t){t.removeEventListener("mousemove",this.onMouseMove),t.removeEventListener("mousedown",this.onMouseDown),t.removeEventListener("mouseup",this.onMouseUp),t.removeEventListener("wheel",this.onWheel),t.removeEventListener("touchmove",this.onTouchMove),t.removeEventListener("touchstart",this.onTouchStart),t.removeEventListener("touchend",this.onTouchEnd)}endFrame(){this._justPressed=!1,this._prevScroll=this._scroll}get state(){return{x:this._x,y:this._y,dx:this._x-this._prevX,dy:this._y-this._prevY,down:this._down,justPressed:this._justPressed,scroll:this._scroll-this._prevScroll}}}class v{constructor(t=0,e=0,r=0){this.x=t,this.y=e,this.z=r}static zero(){return new v(0,0,0)}static up(){return new v(0,1,0)}static forward(){return new v(0,0,-1)}clone(){return new v(this.x,this.y,this.z)}add(t){return new v(this.x+t.x,this.y+t.y,this.z+t.z)}sub(t){return new v(this.x-t.x,this.y-t.y,this.z-t.z)}scale(t){return new v(this.x*t,this.y*t,this.z*t)}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}cross(t){return new v(this.y*t.z-this.z*t.y,this.z*t.x-this.x*t.z,this.x*t.y-this.y*t.x)}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}normalize(){const t=this.length();return t<1e-8?new v:this.scale(1/t)}lerp(t,e){return new v(this.x+(t.x-this.x)*e,this.y+(t.y-this.y)*e,this.z+(t.z-this.z)*e)}toArray(){return new Float32Array([this.x,this.y,this.z])}toArray4(t=1){return new Float32Array([this.x,this.y,this.z,t])}}class m{data;constructor(t){this.data=t??new Float32Array(16)}static identity(){const t=new m;return t.data[0]=1,t.data[5]=1,t.data[10]=1,t.data[15]=1,t}static perspective(t,e,r,i){const n=1/Math.tan(t/2),o=1/(r-i),s=new m;return s.data[0]=n/e,s.data[5]=n,s.data[10]=(i+r)*o,s.data[11]=-1,s.data[14]=2*i*r*o,s}static lookAt(t,e,r){let i={x:e.x-t.x,y:e.y-t.y,z:e.z-t.z};const n=Math.sqrt(i.x*i.x+i.y*i.y+i.z*i.z);n>1e-8&&(i.x/=n,i.y/=n,i.z/=n);let o={x:i.y*r.z-i.z*r.y,y:i.z*r.x-i.x*r.z,z:i.x*r.y-i.y*r.x};const s=Math.sqrt(o.x*o.x+o.y*o.y+o.z*o.z);s>1e-8&&(o.x/=s,o.y/=s,o.z/=s);let l={x:o.y*i.z-o.z*i.y,y:o.z*i.x-o.x*i.z,z:o.x*i.y-o.y*i.x};const a=new m;return a.data[0]=o.x,a.data[1]=l.x,a.data[2]=-i.x,a.data[3]=0,a.data[4]=o.y,a.data[5]=l.y,a.data[6]=-i.y,a.data[7]=0,a.data[8]=o.z,a.data[9]=l.z,a.data[10]=-i.z,a.data[11]=0,a.data[12]=-(o.x*t.x+o.y*t.y+o.z*t.z),a.data[13]=-(l.x*t.x+l.y*t.y+l.z*t.z),a.data[14]=i.x*t.x+i.y*t.y+i.z*t.z,a.data[15]=1,a}static translate(t,e,r){const i=m.identity();return i.data[12]=t,i.data[13]=e,i.data[14]=r,i}static rotateX(t){const e=Math.cos(t),r=Math.sin(t),i=m.identity();return i.data[5]=e,i.data[6]=r,i.data[9]=-r,i.data[10]=e,i}static rotateY(t){const e=Math.cos(t),r=Math.sin(t),i=m.identity();return i.data[0]=e,i.data[2]=-r,i.data[8]=r,i.data[10]=e,i}static scale(t,e,r){const i=new m;return i.data[0]=t,i.data[5]=e,i.data[10]=r,i.data[15]=1,i}multiply(t){const e=this.data,r=t.data,i=new Float32Array(16);for(let n=0;n<4;n++)for(let o=0;o<4;o++){let s=0;for(let l=0;l<4;l++)s+=e[l*4+o]*r[n*4+l];i[n*4+o]=s}return new m(i)}transpose(){const t=this.data;return new m(new Float32Array([t[0],t[4],t[8],t[12],t[1],t[5],t[9],t[13],t[2],t[6],t[10],t[14],t[3],t[7],t[11],t[15]]))}invert(){const t=this.data,e=new Float32Array(16);e[0]=t[5]*(t[10]*t[15]-t[11]*t[14])-t[9]*(t[6]*t[15]-t[7]*t[14])-t[13]*(t[6]*t[11]-t[7]*t[10]),e[1]=-(t[1]*(t[10]*t[15]-t[11]*t[14])-t[9]*(t[2]*t[15]-t[3]*t[14])-t[13]*(t[2]*t[11]-t[3]*t[10])),e[2]=t[1]*(t[6]*t[15]-t[7]*t[14])-t[5]*(t[2]*t[15]-t[3]*t[14])-t[13]*(t[2]*t[7]-t[3]*t[6]),e[3]=-(t[1]*(t[6]*t[11]-t[7]*t[10])-t[5]*(t[2]*t[11]-t[3]*t[10])-t[9]*(t[2]*t[7]-t[3]*t[6])),e[4]=-(t[4]*(t[10]*t[15]-t[11]*t[14])-t[8]*(t[6]*t[15]-t[7]*t[14])-t[12]*(t[6]*t[11]-t[7]*t[10])),e[5]=t[0]*(t[10]*t[15]-t[11]*t[14])-t[8]*(t[2]*t[15]-t[3]*t[14])-t[12]*(t[2]*t[11]-t[3]*t[10]),e[6]=-(t[0]*(t[6]*t[15]-t[7]*t[14])-t[4]*(t[2]*t[15]-t[3]*t[14])-t[12]*(t[2]*t[7]-t[3]*t[6])),e[7]=t[0]*(t[6]*t[11]-t[7]*t[10])-t[4]*(t[2]*t[11]-t[3]*t[10])-t[8]*(t[2]*t[7]-t[3]*t[6]),e[8]=t[4]*(t[9]*t[15]-t[11]*t[13])-t[8]*(t[5]*t[15]-t[7]*t[13])-t[12]*(t[5]*t[11]-t[7]*t[9]),e[9]=-(t[0]*(t[9]*t[15]-t[11]*t[13])-t[8]*(t[1]*t[15]-t[3]*t[13])-t[12]*(t[1]*t[11]-t[3]*t[9])),e[10]=t[0]*(t[5]*t[15]-t[7]*t[13])-t[4]*(t[1]*t[15]-t[3]*t[13])-t[12]*(t[1]*t[7]-t[3]*t[5]),e[11]=-(t[0]*(t[5]*t[11]-t[7]*t[9])-t[4]*(t[1]*t[11]-t[3]*t[9])-t[8]*(t[1]*t[7]-t[3]*t[5])),e[12]=-(t[4]*(t[9]*t[14]-t[10]*t[13])-t[8]*(t[5]*t[14]-t[6]*t[13])-t[12]*(t[5]*t[10]-t[6]*t[9])),e[13]=t[0]*(t[9]*t[14]-t[10]*t[13])-t[8]*(t[1]*t[14]-t[2]*t[13])-t[12]*(t[1]*t[10]-t[2]*t[9]),e[14]=-(t[0]*(t[5]*t[14]-t[6]*t[13])-t[4]*(t[1]*t[14]-t[2]*t[13])-t[12]*(t[1]*t[6]-t[2]*t[5])),e[15]=t[0]*(t[5]*t[10]-t[6]*t[9])-t[4]*(t[1]*t[10]-t[2]*t[9])-t[8]*(t[1]*t[6]-t[2]*t[5]);const r=t[0]*e[0]+t[4]*e[1]+t[8]*e[2]+t[12]*e[3];if(Math.abs(r)<1e-10)return m.identity();const i=1/r;for(let n=0;n<16;n++)e[n]*=i;return new m(e)}static trs(t,e,r,i,n,o,s,l){return m.translate(t,e,r).multiply(m.rotateY(i)).multiply(m.rotateX(n)).multiply(m.scale(o,s,l))}get buffer(){return this.data}}class W{theta=0;phi=Math.PI/4;radius=6;target=new v(0,0,0);viewMatrix=m.identity();projMatrix=m.identity();viewProjMatrix=m.identity();position=new v(0,0,0);targetTheta=0;targetPhi=Math.PI/4;targetRadius=6;targetLookAt=new v(0,0,0);smoothFactor=.08;animTheta=0;animPhi=Math.PI/4;animRadius=6;animating=!1;animTime=0;animDuration=1.5;startTheta=0;startPhi=0;startRadius=0;startTarget=new v(0,0,0);animTargetTheta=0;animTargetPhi=0;animTargetRadius=0;animTargetLookAt=new v(0,0,0);autoOrbitSpeed=.15;constructor(){this.update()}updateInput(t,e){if(this.animating||(t.down&&(this.targetTheta-=t.dx*.005,this.targetPhi=Math.max(.1,Math.min(Math.PI/2-.1,this.targetPhi+t.dy*.005))),this.targetRadius=Math.max(2,Math.min(20,this.targetRadius-t.scroll*3))),t.down||(this.targetTheta+=this.autoOrbitSpeed*e),this.theta+=(this.targetTheta-this.theta)*this.smoothFactor,this.phi+=(this.targetPhi-this.phi)*this.smoothFactor,this.radius+=(this.targetRadius-this.radius)*this.smoothFactor,this.target=this.target.lerp(this.target,.02),this.animating){this.animTime+=e;const r=Math.min(1,this.animTime/this.animDuration),i=this.easeInOutCubic(r);this.radius=this.startRadius+(this.animTargetRadius-this.startRadius)*i,this.theta=this.startTheta+(this.animTargetTheta-this.startTheta)*i,this.phi=this.startPhi+(this.animTargetPhi-this.startPhi)*i,this.target=new v(this.startTarget.x+(this.animTargetLookAt.x-this.startTarget.x)*i,this.startTarget.y+(this.animTargetLookAt.y-this.startTarget.y)*i,this.startTarget.z+(this.animTargetLookAt.z-this.startTarget.z)*i),r>=1&&(this.animating=!1,this.targetTheta=this.theta,this.targetPhi=this.phi,this.targetRadius=this.radius)}this.update()}animateTo(t,e,r,i,n=1.5){this.startTheta=this.theta,this.startPhi=this.phi,this.startRadius=this.radius,this.startTarget=this.target.clone(),this.animTargetTheta=t,this.animTargetPhi=e,this.animTargetRadius=r,this.animTargetLookAt=i.clone(),this.animDuration=n,this.animTime=0,this.animating=!0}update(){const t=new v(this.radius*Math.sin(this.phi)*Math.cos(this.theta),this.radius*Math.cos(this.phi),this.radius*Math.sin(this.phi)*Math.sin(this.theta));this.position=t,this.viewMatrix=m.lookAt({x:t.x,y:t.y,z:t.z},{x:this.target.x,y:this.target.y,z:this.target.z},{x:0,y:1,z:0}),this.viewProjMatrix=this.projMatrix.multiply(this.viewMatrix)}updateProjection(t,e,r,i){this.projMatrix=m.perspective(t,e,r,i),this.update()}getUniforms(){const t=this.viewProjMatrix.buffer,e=this.position,r=new Float32Array(20);return r.set(t,0),r[16]=e.x,r[17]=e.y,r[18]=e.z,r[19]=0,r}easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}}const $=`// SPDX-License-Identifier: MIT
// Particle simulation compute shader — 65K particles with physics

struct Particle {
  position: vec4<f32>,
  velocity: vec4<f32>,
  life: f32,
  seed: f32,
}

struct SimParams {
  deltaTime: f32,
  attractorX: f32,
  attractorY: f32,
  attractorZ: f32,
  time: f32,
  pad: vec3<f32>,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: SimParams;

// Hash from particle seed
fn hash(v: vec2<f32>) -> f32 {
  return fract(sin(dot(v, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let idx = id.x;
  if (idx >= arrayLength(&particles)) { return; }

  var p = particles[idx];

  // Reset dead particles
  if (p.life <= 0.0) {
    let theta = hash(vec2<f32>(f32(idx), 0.0)) * 6.2832;
    let phi = acos(2.0 * hash(vec2<f32>(f32(idx), 1.0)) - 1.0);
    let r = 3.0 + hash(vec2<f32>(f32(idx), 2.0)) * 5.0;
    p.position = vec4<f32>(
      r * sin(phi) * cos(theta),
      (hash(vec2<f32>(f32(idx), 3.0)) - 0.5) * 4.0,
      r * sin(phi) * sin(theta),
      1.0
    );
    p.velocity = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    p.life = 0.5 + hash(vec2<f32>(f32(idx), 4.0)) * 2.0;
    p.seed = hash(vec2<f32>(f32(idx), 5.0));
    particles[idx] = p;
    return;
  }

  // Forces
  let attractor = vec3<f32>(params.attractorX, params.attractorY, params.attractorZ);
  let toAttractor = attractor - p.position.xyz;
  let dist = length(toAttractor);
  let gravityForce = dist > 0.1 ? normalize(toAttractor) * 0.5 / (1.0 + dist * 0.3) : vec3<f32>(0.0);

  // Orbital force (tangential)
  let up = vec3<f32>(0.0, 1.0, 0.0);
  let tangent = normalize(cross(toAttractor, up));
  let orbitalForce = tangent * 0.3;

  // Noise-based wandering
  let noiseAngle = hash(vec2<f32>(p.seed, params.time * 0.1)) * 6.2832;
  let wanderForce = vec3<f32>(cos(noiseAngle), sin(noiseAngle) * 0.5, sin(noiseAngle)) * 0.2;

  // Apply forces
  p.velocity.xyz += (gravityForce + orbitalForce + wanderForce) * params.deltaTime;
  p.velocity.xyz *= 0.98; // damping
  p.position.xyz += p.velocity.xyz * params.deltaTime;

  // Age
  p.life -= params.deltaTime * (0.1 + 0.3 * p.seed);

  particles[idx] = p;
}
`,N=`// SPDX-License-Identifier: MIT
// Particle rendering vertex/fragment shaders

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) size: f32,
}

struct CameraUniform {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4<f32>,
}

struct Particle {
  position: vec4<f32>,
  velocity: vec4<f32>,
  life: f32,
  seed: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> camera: CameraUniform;

// Color palettes
fn palette(t: f32) -> vec3<f32> {
  let a = vec3<f32>(0.5, 0.5, 0.5);
  let b = vec3<f32>(0.5, 0.5, 0.5);
  let c = vec3<f32>(1.0, 1.0, 1.0);
  let d = vec3<f32>(0.263, 0.416, 0.557);
  return a + b * cos(6.28318 * (c * t + d));
}

@vertex
fn main(@builtin(vertex_index) vi: u32) -> VertexOutput {
  let idx = vi / 4u;
  let corner = vi % 4u;

  if (idx >= arrayLength(&particles)) {
    var out: VertexOutput;
    out.position = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    out.color = vec4<f32>(0.0);
    out.size = 0.0;
    return out;
  }

  let p = particles[idx];

  // Size attenuation based on distance
  let size = 0.05 * (1.0 + p.seed * 0.5);

  // Corner offsets for a quad
  let corners = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, 1.0)
  );

  let offset = corners[corner] * size;
  let worldPos = p.position.xyz + vec3<f32>(offset.x, offset.y, 0.0);
  let clipPos = camera.viewProjection * vec4<f32>(worldPos, 1.0);
  clipPos.x += offset.x * clipPos.w * 0.001;
  clipPos.y += offset.y * clipPos.w * 0.001;

  var out: VertexOutput;
  out.position = clipPos;
  out.color = vec4<f32>(palette(p.seed), p.life * 0.5);
  out.size = size;
  return out;
}

@fragment
fn main(in: VertexOutput) -> @location(0) vec4<f32> {
  if (in.color.a < 0.01) { discard; }
  return in.color;
}
`,X=`// SPDX-License-Identifier: MIT
// PBR-ish vertex shader for portfolio objects

struct CameraUniform {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4<f32>,
}

struct ObjectUniform {
  modelMatrix: mat4x4<f32>,
  color: vec4<f32>,
  emissionColor: vec4<f32>,
  id: f32,
}

@group(0) @binding(0) var<uniform> camera: CameraUniform;
@group(1) @binding(0) var<uniform> object: ObjectUniform;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) clipPos: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) worldNormal: vec3<f32>,
  @location(2) color: vec3<f32>,
  @location(3) emission: vec3<f32>,
  @location(4) id: f32,
}

@vertex
fn main(input: VertexInput) -> VertexOutput {
  let worldPos = (object.modelMatrix * vec4<f32>(input.position, 1.0)).xyz;
  let worldNormal = normalize((object.modelMatrix * vec4<f32>(input.normal, 0.0)).xyz);

  var out: VertexOutput;
  out.clipPos = camera.viewProjection * vec4<f32>(worldPos, 1.0);
  out.worldPos = worldPos;
  out.worldNormal = worldNormal;
  out.color = object.color.xyz;
  out.emission = object.emissionColor.xyz;
  out.id = object.id;
  return out;
}
`,q=`// SPDX-License-Identifier: MIT
// Fragment shader with bloom-supporting output (RGBA16F)

@group(2) @binding(0) var<uniform> timeUniform: vec4<f32>;

struct Light {
  position: vec3<f32>,
  color: vec3<f32>,
  intensity: f32,
}

@group(2) @binding(1) var<storage, read> lights: array<Light>;

struct VertexOutput {
  @builtin(position) clipPos: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) worldNormal: vec3<f32>,
  @location(2) color: vec3<f32>,
  @location(3) emission: vec3<f32>,
  @location(4) id: f32,
}

struct LightResult {
  diffuse: vec3<f32>,
  specular: vec3<f32>,
}

fn calculateLight(normal: vec3<f32>, viewDir: vec3<f32>, lightPos: vec3<f32>, lightColor: vec3<f32>, intensity: f32) -> LightResult {
  let lightDir = normalize(lightPos - VertexOutput.worldPos);
  let halfVec = normalize(lightDir + viewDir);

  let nDotL = max(dot(normal, lightDir), 0.0);
  let nDotH = max(dot(normal, halfVec), 0.0);

  let distance = length(lightPos - VertexOutput.worldPos);
  let attenuation = 1.0 / (1.0 + distance * distance * 0.1);

  var result: LightResult;
  result.diffuse = lightColor * nDotL * intensity * attenuation;
  result.specular = lightColor * pow(nDotH, 64.0) * 0.5 * intensity * attenuation;
  return result;
}

@fragment
fn main(in: VertexOutput) -> @location(0) vec4<f32> {
  let viewDir = normalize(cameraPos.xyz - in.worldPos);
  let normal = normalize(in.worldNormal);

  // Accumulate lighting
  var diffuse = vec3<f32>(0.0);
  var specular = vec3<f32>(0.0);

  // Ambient
  diffuse += 0.1 * in.color;

  // Main directional light (from above)
  let sunDir = normalize(vec3<f32>(0.5, 1.0, 0.3));
  let sunDiff = max(dot(normal, sunDir), 0.0);
  diffuse += sunDiff * vec3<f32>(0.6, 0.6, 0.8) * in.color;
  let sunHalf = normalize(sunDir + viewDir);
  specular += pow(max(dot(normal, sunHalf), 0.0), 64.0) * vec3<f32>(0.8, 0.8, 1.0) * 0.3;

  // Rim light
  let rim = 1.0 - max(dot(viewDir, normal), 0.0);
  let rimLight = pow(rim, 3.0) * 0.4;

  // Fresnel
  let fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);

  let finalColor = diffuse + specular + vec3<f32>(rimLight * 0.3) + in.emission * 0.5 + fresnel * vec3<f32>(0.5, 0.4, 0.8) * 0.2;

  return vec4<f32>(finalColor, 1.0);
}
`,H=`// SPDX-License-Identifier: MIT
// Reflective ground plane

struct CameraUniform {
  viewProjection: mat4x4<f32>,
  cameraPos: vec4<f32>,
}

@group(0) @binding(0) var<uniform> camera: CameraUniform;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) uv: vec2<f32>,
}

@vertex
fn main(@location(0) position: vec3<f32>, @location(1) uv: vec2<f32>) -> VertexOutput {
  var out: VertexOutput;
  out.position = camera.viewProjection * vec4<f32>(position, 1.0);
  out.worldPos = position;
  out.uv = uv;
  return out;
}

@fragment
fn main(in: VertexOutput) -> @location(0) vec4<f32> {
  // Simple reflective ground: dark with subtle grid
  let grid = abs(fract(in.uv * 10.0) - 0.5);
  let gridLine = 1.0 - step(0.45, grid.x) * step(0.45, grid.y);

  let fresnel = pow(1.0 - abs(in.worldPos.y / length(in.worldPos - camera.cameraPos.xyz)), 2.0);
  let baseColor = vec3<f32>(0.04, 0.02, 0.06);
  let reflectionTint = vec3<f32>(0.3, 0.2, 0.5);

  let color = mix(baseColor, reflectionTint, fresnel * 0.3) + vec3<f32>(gridLine * 0.05);
  return vec4<f32>(color, 0.8);
}
`,M={particleSim:$,particleRender:N,objectVert:X,objectFrag:q,ground:H},z=65536;class Y{constructor(t){this.deviceManager=t}simPipeline=null;renderPipeline=null;particleBuffer=null;simParamsBuffer=null;cameraBuffer=null;simBindGroup=null;renderBindGroup=null;async init(){const t=this.deviceManager.device,e=M.particleSim,r=M.particleRender,i=t.createShaderModule({code:e}),n=t.createShaderModule({code:r}),o=new Float32Array(z*10);for(let a=0;a<z;a++){const u=a*10,d=Math.random()*Math.PI*2,g=Math.acos(2*Math.random()-1),f=3+Math.random()*5;o[u]=f*Math.sin(g)*Math.cos(d),o[u+1]=(Math.random()-.5)*4,o[u+2]=f*Math.sin(g)*Math.sin(d),o[u+3]=1,o[u+4]=0,o[u+5]=0,o[u+6]=0,o[u+7]=0,o[u+8]=.5+Math.random()*2,o[u+9]=Math.random()}this.particleBuffer=t.createBuffer({size:o.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),t.queue.writeBuffer(this.particleBuffer,0,o),this.simParamsBuffer=t.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.cameraBuffer=t.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const s=t.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}}]});this.simPipeline=t.createComputePipeline({layout:t.createPipelineLayout({bindGroupLayouts:[s]}),compute:{module:i,entryPoint:"main"}}),this.simBindGroup=t.createBindGroup({layout:s,entries:[{binding:0,resource:{buffer:this.particleBuffer}},{binding:1,resource:{buffer:this.simParamsBuffer}}]});const l=t.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}}]});this.renderPipeline=t.createRenderPipeline({layout:t.createPipelineLayout({bindGroupLayouts:[l]}),vertex:{module:n,entryPoint:"main"},fragment:{module:n,entryPoint:"main",targets:[{format:this.deviceManager.format,blend:{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]},primitive:{topology:"triangle-strip"},depthStencil:{format:"depth24plus",depthWriteEnabled:!1,depthCompare:"greater"}}),this.renderBindGroup=t.createBindGroup({layout:l,entries:[{binding:0,resource:{buffer:this.particleBuffer}},{binding:1,resource:{buffer:this.cameraBuffer}}]})}simulate(t,e,r,i){const n=this.deviceManager.device,o=new Float32Array([e,r[0],r[1],r[2],i,0,0,0]);n.queue.writeBuffer(this.simParamsBuffer,0,o);const s=t.beginComputePass();s.setPipeline(this.simPipeline),s.setBindGroup(0,this.simBindGroup),s.dispatchWorkgroups(Math.ceil(z/256)),s.end()}render(t,e){this.deviceManager.device.queue.writeBuffer(this.cameraBuffer,0,e),t.setPipeline(this.renderPipeline),t.setBindGroup(0,this.renderBindGroup),t.draw(z*4)}}function k(c,t,e){const r=[],i=[],n=[],o=[];for(let s=0;s<=e;s++){const l=s/e,a=l*Math.PI;for(let u=0;u<=t;u++){const d=u/t,g=d*Math.PI*2,f=c*Math.sin(a)*Math.cos(g),x=c*Math.cos(a),P=c*Math.sin(a)*Math.sin(g);r.push(f,x,P),i.push(f/c,x/c,P/c),n.push(d,l)}}for(let s=0;s<e;s++)for(let l=0;l<t;l++){const a=s*(t+1)+l,u=a+t+1;o.push(a,u,a+1),o.push(u,u+1,a+1)}return{positions:new Float32Array(r),normals:new Float32Array(i),uvs:new Float32Array(n),indices:new Uint16Array(o),vertexCount:r.length/3,indexCount:o.length}}function K(c,t,e,r){const i=[],n=[],o=[],s=[];for(let l=0;l<=e;l++){const a=l/e,u=a*Math.PI*2;for(let d=0;d<=r;d++){const g=d/r,f=g*Math.PI*2,x=c*Math.cos(f),P=c*Math.sin(f),b=Math.cos(f)*Math.cos(u),p=Math.sin(u),y=Math.sin(f)*Math.cos(u);i.push(x+t*b,t*p,P+t*y),n.push(b,p,y),o.push(g,a)}}for(let l=0;l<e;l++)for(let a=0;a<r;a++){const u=l*(r+1)+a,d=u+r+1;s.push(u,d,u+1),s.push(d,d+1,u+1)}return{positions:new Float32Array(i),normals:new Float32Array(n),uvs:new Float32Array(o),indices:new Uint16Array(s),vertexCount:i.length/3,indexCount:s.length}}function Z(c,t,e,r,i){const n=[],o=[],s=[],l=[];for(let a=0;a<=i;a++){const u=a/i;for(let d=0;d<=i;d++){const g=d/i,f=g*Math.PI*2,x=c+t*Math.cos(r*f),P=x*Math.cos(e*f),b=t*Math.sin(r*f),p=x*Math.sin(e*f),y=.01,h=c+t*Math.cos(r*(f+y)),T=(h*Math.cos(e*(f+y))-P)/y,R=(t*Math.sin(r*(f+y))-b)/y,S=(h*Math.sin(e*(f+y))-p)/y,j=Math.cos(e*f)*(-t*r*Math.sin(r*f))-x*e*Math.sin(e*f),C=Math.sin(e*f)*(-t*r*Math.sin(r*f))+x*e*Math.cos(e*f),A=T*C-S*j,F=R*C-S*0,I=S*j-T*C,D=Math.sqrt(A*A+F*F+I*I)||1;n.push(P,b,p),o.push(A/D,F/D,I/D),s.push(g,u)}}for(let a=0;a<i;a++)for(let u=0;u<i;u++){const d=a*(i+1)+u,g=d+i+1;l.push(d,g,d+1),l.push(g,g+1,d+1)}return{positions:new Float32Array(n),normals:new Float32Array(o),uvs:new Float32Array(s),indices:new Uint16Array(l),vertexCount:n.length/3,indexCount:l.length}}function J(c,t){const e=[],r=[],i=[],n=[];for(let o=0;o<=t;o++){const s=o/t;for(let l=0;l<=t;l++){const a=l/t;e.push(-8+a*c,0,-8+s*c),r.push(0,1,0),i.push(a,s)}}for(let o=0;o<t;o++)for(let s=0;s<t;s++){const l=o*(t+1)+s,a=l+t+1;n.push(l,a,l+1),n.push(a,a+1,l+1)}return{positions:new Float32Array(e),normals:new Float32Array(r),uvs:new Float32Array(i),indices:new Uint16Array(n),vertexCount:e.length/3,indexCount:n.length}}const Q=`
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn main(@builtin(vertex_index) vi: u32) -> VertexOutput {
  let pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  let uv = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 0.0),
    vec2<f32>(2.0, 0.0),
    vec2<f32>(0.0, 2.0)
  );
  var out: VertexOutput;
  out.position = vec4<f32>(pos[vi], 0.0, 1.0);
  out.uv = uv[vi];
  return out;
}
`,tt=`
@group(0) @binding(0) var hdrTex: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let hdr = textureSample(hdrTex, samp, uv).xyz;
  // Reinhard tonemap
  let tonemapped = hdr / (hdr + vec3<f32>(1.0));
  // Gamma
  let gamma = pow(tonemapped, vec3<f32>(1.0 / 2.2));
  return vec4<f32>(gamma, 1.0);
}
`;class et{constructor(t){this.deviceManager=t;const e=t.device;this.particleSystem=new Y(t),this.cameraUniformBuffer=e.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.groundMesh=J(16,40),this.groundVB=this.createVertexBuffer(this.groundMesh),this.groundIB=this.createIndexBuffer(this.groundMesh),this.groundBindGroupLayout=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}}]}),this.blitBindGroupLayout=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]}),this.blitSampler=e.createSampler({minFilter:"linear",magFilter:"linear"});const r=e.createShaderModule({code:M.objectVert}),i=e.createShaderModule({code:M.objectFrag}),n=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"read-only-storage"}}]});this.objectPipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[n]}),vertex:{module:r,entryPoint:"main",buffers:[{attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"}],arrayStride:24}]},fragment:{module:i,entryPoint:"main",targets:[{format:"rgba16float"}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"greater"}});const o=e.createShaderModule({code:M.ground});this.groundPipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[this.groundBindGroupLayout]}),vertex:{module:o,entryPoint:"main",buffers:[{attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x2"}],arrayStride:20}]},fragment:{module:o,entryPoint:"main",targets:[{format:"rgba16float",blend:{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]},primitive:{topology:"triangle-list",cullMode:"none"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"greater"}});const s=e.createShaderModule({code:Q}),l=e.createShaderModule({code:tt});this.blitPipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[this.blitBindGroupLayout]}),vertex:{module:s,entryPoint:"main"},fragment:{module:l,entryPoint:"main",targets:[{format:this.deviceManager.format}]},primitive:{topology:"triangle-list"}})}depthTexture=null;hdrTexture=null;particleSystem;objects=[];groundMesh;groundVB;groundIB;cameraUniformBuffer;objectPipeline;groundPipeline;blitPipeline;blitSampler;blitBindGroupLayout;groundBindGroupLayout;async init(){await this.particleSystem.init(),this.createPortfolioObjects(this.deviceManager.device),this.resize()}createPortfolioObjects(t){const e=[{type:"sphere",color:[.4,.2,.8],emission:[.2,.1,.4],pos:[-3,.5,0]},{type:"torus",color:[.8,.2,.3],emission:[.4,.1,.15],pos:[0,.5,-3]},{type:"knot",color:[.2,.7,.5],emission:[.1,.35,.25],pos:[3,.5,0]},{type:"sphere",color:[.9,.6,.1],emission:[.45,.3,.05],pos:[0,.5,3]},{type:"torus",color:[.1,.4,.8],emission:[.05,.2,.4],pos:[-2.5,.5,2.5]},{type:"knot",color:[.7,.3,.7],emission:[.35,.15,.35],pos:[2.5,.5,-2.5]}];for(let r=0;r<e.length;r++){const i=e[r];let n;switch(i.type){case"sphere":n=k(.5,24,16);break;case"torus":n=K(.5,.2,12,24);break;case"knot":n=Z(.5,.15,2,3,20);break;default:n=k(.5,16,12)}this.objects.push({mesh:n,position:i.pos,rotation:[Math.random()*Math.PI*2,Math.random()*Math.PI*2],scale:1,color:i.color,emission:i.emission,id:r,vertexBuffer:this.createVertexBuffer(n),indexBuffer:this.createIndexBuffer(n),uniformBuffer:t.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})})}}createVertexBuffer(t){const e=new Float32Array(t.vertexCount*6);for(let n=0;n<t.vertexCount;n++)e[n*6]=t.positions[n*3],e[n*6+1]=t.positions[n*3+1],e[n*6+2]=t.positions[n*3+2],e[n*6+3]=t.normals[n*3],e[n*6+4]=t.normals[n*3+1],e[n*6+5]=t.normals[n*3+2];const r=this.deviceManager.device,i=r.createBuffer({size:e.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});return r.queue.writeBuffer(i,0,e),i}createIndexBuffer(t){const e=this.deviceManager.device,r=e.createBuffer({size:t.indices.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST});return e.queue.writeBuffer(r,0,t.indices),r}resize(){const t=this.deviceManager.device,e=this.deviceManager.width,r=this.deviceManager.height;e<2||r<2||(this.depthTexture&&this.depthTexture.destroy(),this.hdrTexture&&this.hdrTexture.destroy(),this.depthTexture=t.createTexture({size:{width:e,height:r},format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),this.hdrTexture=t.createTexture({size:{width:e,height:r},format:"rgba16float",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}))}render(t,e,r,i){const n=this.deviceManager.device;this.deviceManager.width,this.deviceManager.height,this.deviceManager.resize(),this.resize();const o=t.getUniforms();n.queue.writeBuffer(this.cameraUniformBuffer,0,o);const s=n.createCommandEncoder(),l=[(i.x/window.innerWidth-.5)*8,-(i.y/window.innerHeight-.5)*4+1,0];this.particleSystem.simulate(s,r,l,e);const a=this.hdrTexture.createView(),u=this.depthTexture.createView(),d=s.beginRenderPass({colorAttachments:[{view:a,loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:1}}],depthStencilAttachment:{view:u,depthClearValue:0,depthLoadOp:"clear",depthStoreOp:"store"}});for(const p of this.objects){p.rotation[0]+e*.3;const y=p.rotation[1]+e*.2,h=new Float32Array(28);h[0]=p.scale,h[1]=0,h[2]=0,h[3]=0,h[4]=0,h[5]=Math.cos(y)*p.scale,h[6]=Math.sin(y)*p.scale,h[7]=0,h[8]=0,h[9]=-Math.sin(y)*p.scale,h[10]=Math.cos(y)*p.scale,h[11]=0,h[12]=p.position[0],h[13]=p.position[1],h[14]=p.position[2],h[15]=1,h[16]=p.color[0],h[17]=p.color[1],h[18]=p.color[2],h[19]=1,h[20]=p.emission[0],h[21]=p.emission[1],h[22]=p.emission[2],h[23]=0,h[24]=p.id,h[25]=0,h[26]=0,h[27]=0,n.queue.writeBuffer(p.uniformBuffer,0,h);const T=n.createBindGroup({layout:this.objectPipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.cameraUniformBuffer}},{binding:1,resource:{buffer:p.uniformBuffer}},{binding:2,resource:{buffer:this.cameraUniformBuffer}}]});d.setPipeline(this.objectPipeline),d.setBindGroup(0,T),d.setVertexBuffer(0,p.vertexBuffer),d.setIndexBuffer(p.indexBuffer,"uint16"),d.drawIndexed(p.mesh.indexCount)}const g=n.createBindGroup({layout:this.groundBindGroupLayout,entries:[{binding:0,resource:{buffer:this.cameraUniformBuffer}}]});d.setPipeline(this.groundPipeline),d.setBindGroup(0,g),d.setVertexBuffer(0,this.groundVB),d.setIndexBuffer(this.groundIB,"uint16"),d.drawIndexed(this.groundMesh.indexCount),d.end();const f=s.beginRenderPass({colorAttachments:[{view:a,loadOp:"load",storeOp:"store"}],depthStencilAttachment:{view:u,depthLoadOp:"load",depthStoreOp:"store"}});this.particleSystem.render(f,o),f.end();const x=this.deviceManager.context.getCurrentTexture().createView(),P=n.createBindGroup({layout:this.blitBindGroupLayout,entries:[{binding:0,resource:a},{binding:1,resource:this.blitSampler}]}),b=s.beginRenderPass({colorAttachments:[{view:x,loadOp:"clear",storeOp:"store",clearValue:{r:.02,g:.01,b:.04,a:1}}]});b.setPipeline(this.blitPipeline),b.setBindGroup(0,P),b.draw(3),b.end(),n.queue.submit([s.finish()])}}const E=[{id:0,title:"Bikini Bottom Breakout",subtitle:"Canvas Game",description:"Faithful arcade homage — SpongeBob-themed breakout with progressive difficulty, particle effects, and touch controls. Built as standalone HTML/JS, deployed on GitHub Pages.",tags:["Canvas 2D","Game Dev","HTML5","Touch UI"],link:"https://nwfella.github.io/bikini-bottom-breakout/",color:"#6c5ce7"},{id:1,title:"Zaxxon Prime",subtitle:"3D Isometric Shooter",description:"Isometric corridor shooter with WebGL-style 3D projection, enemy AI, weapon system, and mobile touch controls. Full PWA with offline support. MIT licensed.",tags:["WebGL","3D Graphics","Game Dev","PWA"],link:"https://nwfella.github.io/zaxxon-prime/",color:"#e74c3c"},{id:2,title:"LP Manager",subtitle:"DeFi Dashboard",description:"Multi-chain liquidity position manager for Uniswap V2/V3, Aerodrome, PancakeSwap. Encrypted keystore, real-time P&L tracking, V3 rebalancing across Ethereum, Base, BSC, Arbitrum, HyperEVM.",tags:["Web3","DeFi","Python","Smart Contracts"],link:"#",color:"#2ecc71"},{id:3,title:"Daily Cryptograph",subtitle:"Automated Newsletter",description:"Daily AI-generated crypto newspaper in Victorian-era style. Pulls from Cointelegraph, renders as HTML, auto-deploys to GitHub Pages via cron. Runs at 9AM PT daily.",tags:["Automation","AI","Cron","HTML"],link:"https://nwfella.github.io/Bitcoin-and-Crypto-news-06-05-2026/",color:"#f39c12"},{id:4,title:"Polymarket Monitor",subtitle:"Prediction Markets",description:"Real-time Polymarket data queries — market prices, orderbooks, historical trends. Integrated into automated agent workflows for crypto-native research.",tags:["Prediction Markets","API","Data Viz"],link:"#",color:"#3498db"},{id:5,title:"WebGPU Portfolio",subtitle:"This Site",description:"Raw WebGPU + WGSL compute shader engine. 65K GPU-driven particles, bloom post-processing, procedural sky, interactive 3D scene. Zero frameworks — pure GPU programming showcase.",tags:["WebGPU","WGSL","Compute Shaders","TypeScript"],link:"#",color:"#9b59b6"}],it=[{name:"WebGPU",level:.9,category:"Graphics",color:"#6c5ce7"},{name:"TypeScript",level:.95,category:"Language",color:"#3178c6"},{name:"Python",level:.9,category:"Language",color:"#3776ab"},{name:"Canvas 2D",level:.95,category:"Graphics",color:"#e74c3c"},{name:"Web3 / DeFi",level:.85,category:"Blockchain",color:"#2ecc71"},{name:"Solidity",level:.7,category:"Blockchain",color:"#363636"},{name:"WGSL",level:.8,category:"Graphics",color:"#a29bfe"},{name:"HTML/CSS",level:.9,category:"Web",color:"#e34f26"},{name:"Node.js",level:.85,category:"Backend",color:"#339933"},{name:"React",level:.7,category:"Frontend",color:"#61dafb"},{name:"Vite",level:.85,category:"Build",color:"#646cff"},{name:"Git",level:.9,category:"Tooling",color:"#f05032"},{name:"CI/CD",level:.8,category:"DevOps",color:"#2088ff"},{name:"Automation",level:.85,category:"DevOps",color:"#00bcd4"},{name:"Jellyfin",level:.8,category:"Media",color:"#00b4ff"},{name:"Linux",level:.85,category:"Systems",color:"#fcc624"}],B={name:"nwfella",subtitle:"GPU Programmer · Web3 Developer · Canvas Craftsman",bio:"Crypto-native developer building GPU-accelerated web experiences, DeFi dashboards, and arcade game homages. Raw WebGPU, compute shaders, and zero-framework engineering.",github:"https://github.com/nwfella"};class rt{container;cardContainer;infoPanel=null;constructor(){this.container=document.getElementById("ui-overlay"),this.cardContainer=document.createElement("div"),this.cardContainer.id="hud-cards",this.cardContainer.style.cssText=`
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      display: flex; gap: 0.5rem; z-index: 20;
    `,this.container.appendChild(this.cardContainer),this.createProjectDots(),this.createInfoPanel()}createProjectDots(){E.forEach((t,e)=>{const r=document.createElement("div");r.style.cssText=`
        width: 40px; height: 40px; border-radius: 50%;
        background: ${t.color}22; border: 1px solid ${t.color}44;
        cursor: pointer; transition: all 0.3s ease;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.6rem; color: ${t.color}; opacity: 0.6;
        pointer-events: auto;
      `,r.textContent=`${e+1}`,r.addEventListener("mouseenter",()=>{r.style.background=`${t.color}44`,r.style.borderColor=t.color,r.style.opacity="1",r.style.transform="scale(1.15)",this.showProjectInfo(e)}),r.addEventListener("mouseleave",()=>{r.style.background=`${t.color}22`,r.style.borderColor=`${t.color}44`,r.style.opacity="0.6",r.style.transform="scale(1)",this.hideProjectInfo()}),r.addEventListener("click",()=>{t.link!=="#"&&window.open(t.link,"_blank")}),this.cardContainer.appendChild(r)})}createInfoPanel(){this.infoPanel=document.createElement("div"),this.infoPanel.id="hud-info",this.infoPanel.style.cssText=`
      position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%);
      background: rgba(10,10,18,0.85); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
      padding: 1rem 1.5rem; max-width: 380px; width: 90%;
      opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
      transform: translateX(-50%) translateY(10px);
      pointer-events: none; z-index: 19;
    `,this.container.appendChild(this.infoPanel)}showProjectInfo(t){if(!this.infoPanel)return;const e=E[t];this.infoPanel.innerHTML=`
      <div style="font-size: 0.7rem; opacity: 0.5; margin-bottom: 0.25rem;">${e.subtitle}</div>
      <div style="font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem;">${e.title}</div>
      <div style="font-size: 0.8rem; opacity: 0.7; line-height: 1.5; margin-bottom: 0.5rem;">${e.description}</div>
      <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
        ${e.tags.map(r=>`<span style="font-size: 0.65rem; background: ${e.color}22; border: 1px solid ${e.color}33; padding: 0.15rem 0.5rem; border-radius: 3px;">${r}</span>`).join("")}
      </div>
    `,this.infoPanel.style.opacity="1",this.infoPanel.style.transform="translateX(-50%) translateY(0)"}hideProjectInfo(){this.infoPanel&&(this.infoPanel.style.opacity="0",this.infoPanel.style.transform="translateX(-50%) translateY(10px)")}}function L(){const c=document.getElementById("fallback-portfolio");c.classList.add("visible"),c.innerHTML=`
    <div class="fallback-inner">
      <h1>${B.name}</h1>
      <div class="subtitle">${B.subtitle}</div>
      <p>${B.bio}</p>

      <h2 style="margin-top: 3rem; font-weight: 300; letter-spacing: 0.15em;">Projects</h2>
      ${E.map(e=>`
        <div class="project">
          <h3>${e.title} <span style="opacity:0.4; font-weight:300; font-size:0.8rem;">${e.subtitle}</span></h3>
          <p>${e.description}</p>
          <div class="skills" style="margin-top:0.3rem;">
            ${e.tags.map(r=>`<span class="skill-tag">${r}</span>`).join("")}
          </div>
          ${e.link!=="#"?`<a href="${e.link}" target="_blank" style="color:#a29bfe; font-size:0.8rem;">View →</a>`:""}
        </div>
      `).join("")}

      <h2 style="margin-top: 3rem; font-weight: 300; letter-spacing: 0.15em;">Skills</h2>
      <div class="skills">
        ${it.map(e=>`<span class="skill-tag" style="border-color:${e.color}33; background:${e.color}15;">${e.name}</span>`).join("")}
      </div>

      <div class="contact">
        ${`<a href="${B.github}" target="_blank">GitHub ↗</a>`}
      </div>

      <p style="margin-top:3rem; opacity:0.3; font-size:0.75rem;">
        WebGPU is not available in this browser. This static portfolio is the fallback.
      </p>
    </div>
  `;const t=document.querySelector(".webgpu-badge");t&&(t.style.display="none")}function w(c,t,e){return Promise.race([c,new Promise((r,i)=>setTimeout(()=>i(new Error(`TIMEOUT: ${e} (${t}ms)`)),t))])}function G(c){return document.getElementById(c)}class O{fill=G("loader-fill");status=G("loading-status");screen=G("loading-screen");setProgress(t,e){this.fill&&(this.fill.style.width=`${Math.min(100,t)}%`),this.status&&(this.status.textContent=e)}hide(){this.screen&&this.screen.classList.add("hidden")}}async function nt(c){if(!navigator.gpu)return null;try{const t=await w(navigator.gpu.requestAdapter(),3e3,"requestAdapter");if(!t)return null;const e=await w(t.requestDevice(),3e3,"requestDevice");if(!e)return null;const r=c.getContext("webgpu");if(!r)return null;const i=new U;return i.device=e,i.adapter=t,i.canvas=c,i.context=r,i.format=navigator.gpu.getPreferredCanvasFormat(),r.configure({device:e,format:i.format,alphaMode:"premultiplied"}),i}catch{try{const t=await w(navigator.gpu.requestAdapter({powerPreference:"low-power"}),3e3,"requestAdapter (low-power)");if(!t)return null;const e=await w(t.requestDevice(),3e3,"requestDevice (low-power)");if(!e)return null;const r=c.getContext("webgpu");if(!r)return null;const i=new U;return i.device=e,i.adapter=t,i.canvas=c,i.context=r,i.format=navigator.gpu.getPreferredCanvasFormat(),r.configure({device:e,format:i.format,alphaMode:"premultiplied"}),i}catch{return null}}}async function ot(){const c=new O;c.setProgress(5,"checking WebGPU support...");const t=G("gpu-canvas");if(!t){c.setProgress(100,"canvas not found"),setTimeout(()=>{c.hide(),L()},200);return}c.setProgress(10,"acquiring GPU device...");const e=await nt(t);if(!e){c.setProgress(100,"WebGPU unavailable — showing static portfolio"),setTimeout(()=>{c.hide(),L()},300);return}try{c.setProgress(30,"bundling shaders...");const r=new W,i=new _,n=new V,o=new et(e);c.setProgress(50,"building particle system..."),await w(o.init(),8e3,"renderer initialization"),c.setProgress(70,"configuring scene..."),r.updateProjection(Math.PI/4,e.aspect,.1,100),i.attach(t);const s=new rt;c.setProgress(85,"starting render loop..."),e.resize();let l=0;const a=()=>{n.tick();const u=n.delta,d=n.elapsed;(t.clientWidth!==e.width||t.clientHeight!==e.height)&&(e.resize(),r.updateProjection(Math.PI/4,e.aspect,.1,100),o.resize()),i.endFrame(),r.updateInput(i.state,u),r.updateProjection(Math.PI/4,e.aspect,.1,100),o.render(r,d,u,i.state);for(const g of o.objects)g.rotation[0]+=u*.3,g.rotation[1]+=u*.2;l===0&&(c.setProgress(100,"⚡ running"),setTimeout(()=>c.hide(),200)),l++,requestAnimationFrame(a)};requestAnimationFrame(a)}catch(r){console.error("WebGPU init failed:",r),c.setProgress(100,"WebGPU unavailable — showing static portfolio"),setTimeout(()=>{c.hide(),L()},400)}}ot().catch(c=>{console.error("Fatal error:",c);const t=new O;t.setProgress(100,"Error — showing static portfolio"),setTimeout(()=>{t.hide(),L()},300)});
