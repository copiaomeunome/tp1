const status = {
    DIALOGO:0,
    CUTSCENE:1,
    GAMEPLAY:2
};

class Protagonista{
    constructor(){
        this.pos = {x:10,y:10}; // posição inicial
        this.velocity = {x:10,y:10}; // velocidade
        this.isMoving = {up:false, down:false, left:false, right:false} // está se movendo?
    }
}

let protagonista = new Protagonista;
export class Scene{
    constructor(){
        this.status = status.DIALOGO;
        this.level = 0;
        this.dialog_position = 0;
        this.enemies = [];
        this.walls = [];
        this.towers = [];
    }
    update() {
        if (protagonista.isMoving.up)
            protagonista.pos.y += protagonista.velocity.y;
        if (protagonista.isMoving.down)
            protagonista.pos.y -= protagonista.velocity.y;
        if (protagonista.isMoving.left)
            protagonista.pos.x -= protagonista.velocity.x;
        if (protagonista.isMoving.right)
            protagonista.pos.x += protagonista.velocity.x;
        return {protagonista: protagonista,walls: this.walls,enemies: this.enemies, towers: this.towers};
    }
    async dialog(){
        const json = await fetch(`../dialogs/dialog${this.level}.json`).json();
        let dialog = json.dialogs[this.dialog_position];
        this.dialog_position++;
        if(json.dialogs.size()==this.dialog_position) this.dialog_position = 0;
        return dialog;
    }
}
document.addEventListener("keydown", (event) => {
    if(event.key.toLowerCase() === "w")protagonista.isMoving.up = true;
    if(event.key.toLowerCase() === "s")protagonista.isMoving.down = true;
    if(event.key.toLowerCase() === "a")protagonista.isMoving.left = true;
    if(event.key.toLowerCase() === "d")protagonista.isMoving.right = true;
});

document.addEventListener("keyup", (event) => {
    if(event.key.toLowerCase() === "w")protagonista.isMoving.up = false;
    if(event.key.toLowerCase() === "s")protagonista.isMoving.down = false;
    if(event.key.toLowerCase() === "a")protagonista.isMoving.left = false;
    if(event.key.toLowerCase() === "d")protagonista.isMoving.right = false;
});