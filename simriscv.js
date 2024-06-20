import PEG from './pvm/parser.js'
import CPU from './pvm/cpu.js'


let input = 
`
_start:
        lw t1, 10
        lw t2, 10
        add t3, t1, t2
        mv t0, t3

`

let instr = []

document.getElementById("code").value = input




function assemble() {
    let code = "";
    code = document.getElementById("code").value;
    document.getElementById("console").innerHTML = "";
    try {
        instr = PEG.parse(x);
        document.getElementById("console").innerHTML = JSON.stringify(instr); 
     } catch (e) {
            document.getElementById("console").innerHTML = e;
    }
}

function run() {

}


document.getElementById('code').addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
  
      // set textarea value to: text before caret + tab + text after caret
      this.value = this.value.substring(0, start) +
        "\t" + this.value.substring(end);
  
      // put caret at right position again
      this.selectionStart =
        this.selectionEnd = start + 1;
    }
  });
  