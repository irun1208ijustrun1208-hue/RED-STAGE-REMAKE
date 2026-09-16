#version 330 core
uniform mat4 u_proj;
in vec2 in_pos;
in vec2 in_uv;
in vec4 in_color;
out vec2 v_uv;
out vec4 v_color;
void main() {
    v_uv = in_uv;
    v_color = in_color;
    gl_Position = u_proj * vec4(in_pos, 0.0, 1.0);
}
