#version 330 core
// FLUX(노브) 커서 — 회전하는 "에너지 결정"(faceted crystal) 임포스터.
// game/playfield.py 의 _draw_flux_orb() 가 커서 위치에 작은 사각형 하나를 놓고
// 이 셰이더로 매 프레임 그립니다 (실제 지오메트리 없이 프래그먼트 셰이더만으로
// 깎인 보석처럼 보이게 하는 기법 — 타이틀 로고 글리치와 같은 임포스터 방식).
//
// 예전엔 매끈한 유리 "보라색 공"이었는데, 다른 노트류(다이아몬드/장방형 등)와
// 실루엣이 구분되지 않아 특색이 없다는 지적으로 육각 결정 모양으로 바꿨습니다.
// 천천히 자전하며 면(facet)마다 다른 밝기를 줘서 "깎인 보석"처럼 보이게 하고,
// 표면을 스치는 하이라이트 한 줄기가 도는 것으로 살아있는 느낌을 유지합니다.
uniform float u_time;
uniform vec3  u_color;      // 결정 기본 색 (테마 ACCENT_3/FLUX_COLOR 등)
uniform float u_strength;   // 0~1. FLUX 구간이 지금 활성 상태인 정도
uniform float u_warning;    // 0~1. 곧 시작할 예고 상태(하얗게 더 반짝임)

in vec2 v_uv;
out vec4 f_color;

const float PI = 3.14159265;
const float TWO_PI = 6.28318531;
const float SIDES = 6.0;

void main() {
    vec2 c = v_uv * 2.0 - 1.0;

    // 천천히 자전 (예고 중엔 더 빠르게 — 곧 온다는 긴장감)
    float spin = u_time * (0.55 + 0.6 * u_warning);
    float ca = cos(spin), sa = sin(spin);
    vec2 rc = vec2(c.x * ca - c.y * sa, c.x * sa + c.y * ca);

    float ang = atan(rc.y, rc.x);
    float sector = TWO_PI / SIDES;
    float a2 = mod(ang + PI, sector) - sector * 0.5;
    // 각도별 정육각형 반지름 — length(rc)/polyR <= 1 이면 육각형 내부
    float polyR = cos(sector * 0.5) / cos(a2);
    float dist = length(rc) / polyR;
    if (dist > 1.0) {
        discard;
    }

    // 육각형을 중심에서부터 6조각으로 나눠 조각마다 밝기를 달리해서
    // "깎인 보석" 느낌을 냅니다.
    float facetIdx = floor((ang + PI) / sector);
    float facetShade = 0.65 + 0.35 * sin(facetIdx * 2.4 + 1.3);

    // 중심 코어(뾰족하게 밝은 심)와 가장자리 림 라이트
    float core = 1.0 - smoothstep(0.0, 0.85, dist);
    float rim = smoothstep(0.78, 1.0, dist);

    // 면을 가로질러 스치는 반짝임 한 줄기
    float glint = pow(max(0.0, cos(a2 * 3.0 - u_time * 2.6)), 20.0);

    vec3 warmWhite = vec3(1.0, 0.98, 0.94);
    vec3 base = u_color * (0.45 + 0.55 * facetShade);
    base += warmWhite * core * 0.5;
    base += warmWhite * glint * 0.85;
    base += u_color * rim * 0.55;
    base = mix(base, warmWhite, u_warning * 0.55);

    // 테두리 한 겹은 항상 밝게 그어서 다각형 윤곽을 또렷하게 유지
    float edgeLine = smoothstep(0.90, 0.97, dist) - smoothstep(0.985, 1.0, dist);
    base = mix(base, warmWhite, edgeLine * 0.5);

    float alpha = 0.62 + 0.38 * u_strength;
    f_color = vec4(base, alpha);
}
