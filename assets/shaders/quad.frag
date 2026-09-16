#version 330 core
uniform sampler2D u_tex;
in vec2 v_uv;
in vec4 v_color;
out vec4 f_color;
void main() {
    vec4 t = texture(u_tex, v_uv);
    f_color = t * v_color;
    if (f_color.a <= 0.001) discard;
}
