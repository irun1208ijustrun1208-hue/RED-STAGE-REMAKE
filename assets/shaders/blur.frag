#version 330 core
uniform sampler2D u_tex;
uniform vec2 u_dir;      // 픽셀 단위 방향 (1/w, 0) 또는 (0, 1/h)
in vec2 v_uv;
out vec4 f_color;

const float W[5] = float[](0.227027, 0.194594, 0.121621, 0.054054, 0.016216);

void main() {
    vec3 c = texture(u_tex, v_uv).rgb * W[0];
    for (int i = 1; i < 5; ++i) {
        vec2 o = u_dir * float(i) * 1.3;
        c += texture(u_tex, v_uv + o).rgb * W[i];
        c += texture(u_tex, v_uv - o).rgb * W[i];
    }
    f_color = vec4(c, 1.0);
}
