#version 330 core
// 가벼운 FXAA(엣지 감지형 안티에일리어싱) 근사 구현.
// MSAA 처럼 오프스크린 멀티샘플 버퍼가 필요 없어서, 이미 완성된 화면(포스트 FX
// 합성까지 끝난 텍스처) 위에 한 패스만 더 돌리면 됩니다 — settings.json 의
// video.antialiasing 이 켜지면 gfx/postfx.py 가 이 셰이더를 마지막에 한 번 더 씁니다.
uniform sampler2D u_tex;
uniform vec2 u_texel;      // 1/가로해상도, 1/세로해상도
uniform float u_quality;   // 0~1. 낮을수록 가볍고 약하게, 높을수록 더 부드럽게

in vec2 v_uv;
out vec4 f_color;

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
    vec3 colCenter = texture(u_tex, v_uv).rgb;

    float lumaC = luma(colCenter);
    float lumaN = luma(texture(u_tex, v_uv + vec2(0.0, -u_texel.y)).rgb);
    float lumaS = luma(texture(u_tex, v_uv + vec2(0.0,  u_texel.y)).rgb);
    float lumaE = luma(texture(u_tex, v_uv + vec2( u_texel.x, 0.0)).rgb);
    float lumaW = luma(texture(u_tex, v_uv + vec2(-u_texel.x, 0.0)).rgb);

    float lumaMin = min(lumaC, min(min(lumaN, lumaS), min(lumaE, lumaW)));
    float lumaMax = max(lumaC, max(max(lumaN, lumaS), max(lumaE, lumaW)));
    float range = lumaMax - lumaMin;

    // 대비가 낮은(엣지가 아닌) 곳은 그대로 통과 — 성능도 아끼고 불필요한 흐림도 방지
    float threshold = mix(0.0833, 0.0312, clamp(u_quality, 0.0, 1.0));
    if (range < max(0.0312, lumaMax * threshold)) {
        f_color = vec4(colCenter, 1.0);
        return;
    }

    float lumaNE = luma(texture(u_tex, v_uv + vec2( u_texel.x, -u_texel.y)).rgb);
    float lumaNW = luma(texture(u_tex, v_uv + vec2(-u_texel.x, -u_texel.y)).rgb);
    float lumaSE = luma(texture(u_tex, v_uv + vec2( u_texel.x,  u_texel.y)).rgb);
    float lumaSW = luma(texture(u_tex, v_uv + vec2(-u_texel.x,  u_texel.y)).rgb);

    float edgeHoriz = abs(lumaNW + lumaNE - 2.0 * lumaN) * 2.0
                    + abs(lumaW  + lumaE  - 2.0 * lumaC)
                    + abs(lumaSW + lumaSE - 2.0 * lumaS);
    float edgeVert  = abs(lumaNW + lumaSW - 2.0 * lumaW) * 2.0
                    + abs(lumaN  + lumaS  - 2.0 * lumaC)
                    + abs(lumaNE + lumaSE - 2.0 * lumaE);
    bool isHoriz = edgeHoriz >= edgeVert;

    vec2 dir = isHoriz ? vec2(0.0, u_texel.y) : vec2(u_texel.x, 0.0);
    float lumaP = isHoriz ? lumaS : lumaE;
    float lumaNeg = isHoriz ? lumaN : lumaW;
    float gradP = abs(lumaP - lumaC);
    float gradN = abs(lumaNeg - lumaC);
    float blendDir = gradP >= gradN ? 1.0 : -1.0;

    float blendAmount = clamp(range / max(lumaMax, 0.0001), 0.0, 1.0) * mix(0.35, 0.85, u_quality);
    vec2 offset = dir * blendDir * blendAmount;
    vec3 blended = texture(u_tex, v_uv + offset).rgb;
    f_color = vec4(mix(colCenter, blended, 0.9), 1.0);
}
