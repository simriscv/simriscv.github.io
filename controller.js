// import model 
import { StartRules, SyntaxError, parse } from './pvm/parser.mjs'
import CPU from './pvm/cpu.mjs'


const vm = new CPU();


// assemble code
export function assemble() {
    let code = "";
    let quad_json = "";
    document.getElementById("console").value += "assemble\n";
    code = document.getElementById("code").value;
    try {
        vm.instructions = parse(code);
        quad_json = JSON.stringify(vm.instructions); 
        document.getElementById("console").value += quad_json+'\n$ ';
     } catch (e) {
        document.getElementById("console").value += e+'\n$ ';
    }
}

// run program
export function run() {

}

// load initial code
window.onload = function() {
    let input = ".global _start\n\n_start:\n\tli t0, 15\n\tli t1, -2\n\tadd t2, t0, t1\n\tmv a0, t2\n\tli a7, 93\n\tecall\n"
    document.getElementById("code").value = input
};


// tab handler
function tabHandler(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
        this.value = this.value.substring(0, start) +
          "\t" + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
    }
}

// del handler
function delHandler(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
    }
}

// keydown listener for tab handler
document.getElementById('code').addEventListener('keydown', tabHandler);


// keydown listener for delete and backspace handler
document.getElementById('console').addEventListener('keydown', delHandler);


// assemble button listener
document.addEventListener('DOMContentLoaded', function() {
  const loadButton = document.getElementById('assemble');
  loadButton.addEventListener('click', function() {
      assemble();
  });
});
