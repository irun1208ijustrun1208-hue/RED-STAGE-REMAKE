#version 330 core
uniform sampler2D u_tex;
uniform float u_threshold;
in vec2 v_uv;
out vec4 f_color;
void main() {
    vec3 c = texture(u_tex, v_uv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float k = max(l - u_threshold, 0.0) / max(l, 0.0001);
    f_color = vec4(c * k, 1.0);
}
