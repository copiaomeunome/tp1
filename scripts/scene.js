const status = {
    DIALOGO:0,
    CUTSCENE:1;
    GAMEPLAY:2
};

export class scene{
    constructor(){
        this.status = {status.DIALOGO};
        this.level = 0;
        this.dialog_position = 0;
    }
    async dialog = ()=>{
        const json = await fetch(`../dialogs/dialog${this.level}.json`).json;
        this.dialog_position++;
        if(json.dialogs.size()==this.dialog_position) this.dialog_position = 0;
        let dialog = json.dialogs[this.dialog_position];
        return {new Float32Array([
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            tx, ty, 0,  1
        ])}
    }
}