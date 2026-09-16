#version 330 core
// 타이틀 로고 글자용 "자연스러운" 글리치. 계속 흔들리는 사인파 대신, 불규칙한
// 간격으로 아주 짧게(~0.1초) 슬라이스가 어긋나고 가장자리에 색 번짐이 생겼다가
// 사라집니다. scenes/title.py 가 로고 텍스트를 한 번 텍스처에 구워두고, 매
// 프레임 이 셰이더로 그 텍스처만 다시 그립니다.
uniform sampler2D u_tex;      // 흰 글자 + 알파(커버리지) 텍스처
uniform float u_time;
uniform float u_alpha;        // 페이드인용 전체 불투명도
uniform vec4 u_color_a;       // 글리치 중 왼쪽으로 어긋나는 고스트 색
uniform vec4 u_color_b;       // 글리치 중 오른쪽으로 어긋나는 고스트 색

in vec2 v_uv;
out vec4 f_color;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
    // 2.3 초 단위 슬롯마다 18% 확률로만 버스트가 오고, 버스트는 슬롯 앞부분
    // 22% 구간에서만 반짝입니다 - "가끔, 아주 잠깐" 어긋나는 느낌을 냅니다.
    float slot = floor(u_time * 2.3);
    float active = step(0.82, hash(slot));
    float phase = fract(u_time * 2.3);
    float burst = active * smoothstep(0.0, 0.08, phase) * (1.0 - smoothstep(0.08, 0.22, phase));

    vec2 uv = v_uv;
    float aMain;
    vec3 col;
    float outA;

    if (burst > 0.002) {
        float sliceId = floor(uv.y * 18.0);
        uv.x += (hash(sliceId + slot * 91.7) - 0.5) * 0.05 * burst;

        aMain = texture(u_tex, clamp(uv, 0.0, 1.0)).a;
        float split = burst * 0.008;
        float aA = texture(u_tex, clamp(uv + vec2(split, 0.0), 0.0, 1.0)).a;
        float aB = texture(u_tex, clamp(uv - vec2(split, 0.0), 0.0, 1.0)).a;
        col = vec3(1.0) * aMain + u_color_a.rgb * aA * 0.7 + u_color_b.rgb * aB * 0.7;
        outA = clamp(aMain + (aA + aB) * 0.5, 0.0, 1.0);
    } else {
        aMain = texture(u_tex, uv).a;
        col = vec3(1.0) * aMain;
        outA = aMain;
    }

    f_color = vec4(col, outA * u_alpha);
}
