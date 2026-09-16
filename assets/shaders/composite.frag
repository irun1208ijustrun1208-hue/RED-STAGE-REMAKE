#version 330 core
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_bloom_amount;
uniform float u_chromatic;
uniform float u_vignette;
uniform vec2  u_shake;      // 화면 흔들림 (uv 단위)
uniform vec4  u_flash;      // rgb + 강도
uniform float u_time;
uniform float u_spin;       // 화면 회전각(라디안) — "쫀득하게 돌아감" 기믹용, 평소엔 0

// SYNC 히트 지점에서 원형으로 퍼지는 굴절 링. 각 vec4 = (x, y, age초, power).
// power<=0 이면 안 쓰는 슬롯. gfx/postfx.py PostFX.shockwave() 가 채웁니다.
uniform int  u_shock_count;
uniform vec4 u_shocks[4];

in vec2 v_uv;
out vec4 f_color;

void main() {
    vec2 uv = v_uv;
    if (abs(u_spin) > 0.0001) {
        vec2 c0 = uv - 0.5;
        float sn = sin(u_spin), cs = cos(u_spin);
        uv = vec2(c0.x * cs - c0.y * sn, c0.x * sn + c0.y * cs) + 0.5;
    }
    uv = clamp(uv + u_shake, 0.0, 1.0);

    // 충격파 — 링 반경(age*속도)과 픽셀 거리 차이가 작을수록 바깥으로 밀어내는
    // 굴절을 주고, 감쇠(age 가 커질수록 옅어짐)를 곱해서 자연스럽게 사라지게 합니다.
    vec3 shock_glow = vec3(0.0);
    for (int i = 0; i < u_shock_count && i < 4; i++) {
        vec4 s = u_shocks[i];
        vec2 d = uv - s.xy;
        float dist = length(d);
        float ring = s.z * 1.6;                 // 링 반경 (uv 단위, 초당 1.6 화면폭 속도)
        float fall = exp(-s.z * 5.0) * s.w;      // 시간 감쇠 x 세기
        float band = exp(-pow((dist - ring) * 26.0, 2.0)) * fall;
        if (dist > 0.0001) {
            uv += normalize(d) * band * 0.007;
        }
        shock_glow += vec3(0.75, 0.9, 1.0) * band * 0.16;
    }

    vec2 c = uv - 0.5;
    float r2 = dot(c, c);

    // 색수차: 화면 가장자리로 갈수록 세게
    vec3 col;
    if (u_chromatic > 0.0005) {
        vec2 off = c * u_chromatic * 0.007 * (0.25 + r2);
        col.r = texture(u_scene, clamp(uv + off, 0.0, 1.0)).r;
        col.g = texture(u_scene, uv).g;
        col.b = texture(u_scene, clamp(uv - off, 0.0, 1.0)).b;
    } else {
        col = texture(u_scene, uv).rgb;
    }

    col += texture(u_bloom, uv).rgb * u_bloom_amount;
    col += shock_glow;
    col = mix(col, u_flash.rgb, clamp(u_flash.a, 0.0, 1.0));

    float vig = 1.0 - u_vignette * smoothstep(0.15, 0.75, r2);
    col *= vig;

    // 아주 약한 필름 그레인 (밴딩 완화)
    float n = fract(sin(dot(uv * vec2(1920.0, 1080.0) + u_time, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) * 0.0045;

    f_color = vec4(col, 1.0);
}
