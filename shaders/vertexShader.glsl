#version 300 es

in vec2 position;
in vec2 a_texcoord;

uniform mat4 projection;
uniform mat4 model;

out vec2 v_texcoord;

void main() {
    gl_Position = projection * model * vec4(position, 0.0, 1.0);

    v_texcoord = a_texcoord;
}