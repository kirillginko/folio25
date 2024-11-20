export const ripplesVs = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  // default mandatory variables
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  // custom variables
  varying vec2 vTextureCoord;
  void main() {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
  }
`;
export const ripplesFs = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  uniform vec2 uResolution;
  uniform vec2 uMousePosition;
  uniform vec2 uVelocity;
  uniform int uTime;
  uniform sampler2D uRipples;
  uniform float uViscosity;
  uniform float uSpeed;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uDissipation;
  varying vec2 vTextureCoord;
  void main() {
    // uniformize size for different screens
    float size = uSize;
    vec2 refScreen = vec2(1600.0, 900.0);
    float resoLength = length(uResolution / uPixelRatio);
    float screenRatio = length(refScreen) / resoLength;
    // flatten result for wider screens
    screenRatio = pow(screenRatio, min(1.0, screenRatio));
    size *= screenRatio;
    float velocity = clamp(length(uVelocity), 0.1, 1.5);
    vec3 speed = vec3(vec2(uSpeed) / (uResolution.xy * screenRatio), 0.0);
    vec2 mouse = (uMousePosition + 1.0) * 0.5;
    vec4 color = texture2D(uRipples, vTextureCoord);
    float shade = smoothstep(0.02 * size * velocity, 0.0, length(mouse - vTextureCoord));
    vec4 texelColor = color;
    float d = shade * uViscosity;
    float top = texture2D(uRipples, vTextureCoord - speed.zy, 1.0).x;
    float right = texture2D(uRipples, vTextureCoord - speed.xz, 1.0).x;
    float bottom = texture2D(uRipples, vTextureCoord + speed.xz, 1.0).x;
    float left = texture2D(uRipples, vTextureCoord + speed.zy, 1.0).x;
    d += -(texelColor.y - 0.5) * 2.0 + (top + right + bottom + left - 2.0);
    d *= uDissipation;
    // skip first frames
    d *= float(uTime > 5);
    d = d * 0.5 + 0.5;
    color = vec4(d, texelColor.x, 0.0, 1.0);
    gl_FragColor = color;
  }
`;
export const renderFs = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;
  uniform sampler2D uRenderTexture;
  uniform sampler2D uRipplesTexture;
  uniform vec2 uResolution;
  uniform float uHue;
  uniform float uSaturation;
  uniform vec3 uBgColor;
  uniform vec3 uRippleColor;
  #define PI 3.14159265359
  const float lightStrength = 5.0;
  const float lightColorEffect = 1.0;
  const float shadowStrength = 1.25;
  const float shadowColorEffect = 0.4375;
  // Holy fuck balls, fresnel!
  const float bias = 0.2;
  const float scale = 10.0;
  const float power = 10.1;
  vec3 hueRotate(vec3 col, float hue) {
    vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hue);
    return col * cosAngle + cross(k, col) * sin(hue) + k * dot(k, col) * (1.0 - cosAngle);
  }
  vec3 saturate(vec3 rgb, float adjustment) {
    vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
  }
  float bumpMap(vec2 uv, float height, inout vec3 colormap) {
    vec3 shade = texture2D(uRipplesTexture, vTextureCoord).rgb;
    return 1.0 - shade.r * height;
  }
  float bumpMap(vec2 uv, float height) {
    vec3 colormap;
    return bumpMap(uv, height, colormap);
  }
    vec3 rgb2glsl(vec3 rgb) {
    return vec3(rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0);
  }
  vec4 rgb2glsl(vec4 rgb) {
    return vec4(rgb2glsl(rgb.rgb), rgb.a);
  }
  // add bump map, reflections and lightnings to the ripples render target texture
  vec4 renderPass(vec2 uv, inout float distortion) {
    vec3 surfacePos = vec3(uv, 0.0);
    vec3 ray = normalize(vec3(uv, 1.0));
    vec3 lightPos = vec3(0.0, 0.0, -4.0);
    vec3 normal = vec3(0.0, 0.0, -1.0);
    vec2 sampleDistance = vec2(0.005, 0.0);
    vec3 colormap;
    float fx = bumpMap(sampleDistance.xy, 0.2);
    float fy = bumpMap(sampleDistance.yx, 0.2);
    float f = bumpMap(vec2(0.0), 0.2, colormap);
    distortion = f;
    fx = (fx - f) / sampleDistance.x;
    fy = (fy - f) / sampleDistance.x;
    normal = normalize(normal + vec3(fx, fy, 0.0) * 0.2);
    vec3 lightV = lightPos - surfacePos;
    float lightDist = max(length(lightV), 0.001);
    lightV /= lightDist;
    vec3 lightColor = vec3(1.0);
    float shininess = 0.1;
    float brightness = 1.0;
    float falloff = 0.1;
    float attenuation = 3.0 / (1.0 + lightDist * lightDist * falloff);
    float diffuse = max(dot(normal, lightV), 0.0);
    float specular = pow(max(dot(reflect(-lightV, normal), -ray), 0.0), 64.0) * shininess;
    vec3 texCol = (vec3(0.5) * brightness) * 0.5;
    float metalness = (1.0 - colormap.x);
    metalness *= metalness;
    vec3 color = (texCol * (diffuse * vec3(0.9) * 2.0 + 0.5) + lightColor * specular * f * 2.0 * metalness) * attenuation;
    return vec4(color, 1.0);
  }
  void main() {
    float distortion;
    vec4 reflections = renderPass(vTextureCoord, distortion);
    vec4 ripples = vec4(vec3(0.5), 1.0);
    ripples += distortion * 0.1 - 0.1;
    ripples += reflections * 0.5;
    vec4 color = vec4(uBgColor, 1.0);
    float lights = max(0.001, ripples.r - (0.7 + lightStrength * 0.025));
    float shadow = max(0.001, 1.0 - (ripples.r + 0.5));
    vec3 rippleColor = uRippleColor;
    vec3 color1 = rippleColor;
    vec3 color2 = rippleColor * 0.9;
    vec3 color3 = rippleColor * 0.8;
    vec3 color4 = rippleColor * 0.7;
    vec3 color5 = rippleColor * 0.6;
    vec3 color6 = rippleColor * 1.1;
    vec3 color7 = rippleColor * 1.2;
    color1 = saturate(hueRotate(color1, uHue), uSaturation);
    color2 = saturate(hueRotate(color2, uHue), uSaturation);
    color3 = saturate(hueRotate(color3, uHue), uSaturation);
    color4 = saturate(hueRotate(color4, uHue), uSaturation);
    color5 = saturate(hueRotate(color5, uHue), uSaturation);
    color6 = saturate(hueRotate(color6, uHue), uSaturation);
    color7 = saturate(hueRotate(color7, uHue), uSaturation);
    float lightMixValue = clamp(pow(lights, 3.5) * 5.0, 0.0, 1.0);
    float lightMixValue2 = clamp(pow(lights * 0.95, 5.0) * 10.0, 0.0, 1.0);
    float lightMixValue3 = clamp(pow(lights * 0.9, 6.5) * 15.0, 0.0, 1.0);
    float lightMixValue4 = clamp(pow(lights * 0.85, 7.0) * 30.0, 0.0, 1.0);
    float lightMixValue5 = clamp(pow(lights * 0.8, 7.25) * 70.0, 0.0, 1.0);
    float lightMixValue6 = clamp(pow(lights * 0.75, 8.5) * 100.0, 0.0, 1.0);
    float lightMixValue7 = clamp(pow(lights * 0.7, 10.0) * 50.0, 0.0, 1.0);
    vec3 lightColor = mix(color.rgb, color1, lightMixValue);
    lightColor = mix(lightColor, color2, lightMixValue2);
    lightColor = mix(lightColor, color3, lightMixValue3);
    lightColor = mix(lightColor, color4, lightMixValue4);
    lightColor = mix(lightColor, color5, lightMixValue5);
    lightColor = mix(lightColor, color6, lightMixValue6);
    lightColor = mix(lightColor, color7, lightMixValue7);
    color.rgb = mix(color.rgb, lightColor, lightColorEffect);
    float shadowMixValue = clamp(pow(shadow, 3.0) * 5.0, 0.0, 1.0);
    float shadowMixValue2 = clamp(pow(shadow * 0.95, 5.0) * 10.0, 0.0, 1.0);
    float shadowMixValue3 = clamp(pow(shadow * 0.9, 6.5) * 15.0, 0.0, 1.0);
    float shadowMixValue4 = clamp(pow(shadow * 0.85, 8.0) * 20.0, 0.0, 1.0);
    float shadowMixValue5 = clamp(pow(shadow * 0.8, 12.0) * 25.0, 0.0, 1.0);
    float shadowMixValue6 = clamp(pow(shadow * 0.75, 16.0) * 30.0, 0.0, 1.0);
    float shadowMixValue7 = clamp(pow(shadow * 0.7, 20.0) * 20.0, 0.0, 1.0);
    float shadowAttenuation = 0.875;
    vec3 shadowColor = mix(color.rgb, color1 * shadowAttenuation, shadowMixValue);
    shadowColor = mix(shadowColor, color2 * shadowAttenuation, shadowMixValue2);
    shadowColor = mix(shadowColor, color3 * shadowAttenuation, shadowMixValue3);
    shadowColor = mix(shadowColor, color4 * shadowAttenuation, shadowMixValue4);
    shadowColor = mix(shadowColor, color5 * shadowAttenuation, shadowMixValue5);
    shadowColor = mix(shadowColor, color6 * shadowAttenuation, shadowMixValue6);
    shadowColor = mix(shadowColor, color7 * shadowAttenuation, shadowMixValue7);
    color.rgb = mix(color.rgb, shadowColor, shadowColorEffect);
    // Adjust alpha based on background color (lighter background = more transparent)
    float avgBgColor = (uBgColor.r + uBgColor.g + uBgColor.b) / 3.0;
    float alphaAdjust = mix(0.3, 0.3, avgBgColor); // More transparent for lighter backgrounds
    
    color.a = alphaAdjust; // Apply adjusted transparency
    
    gl_FragColor = color;
  }
`;
