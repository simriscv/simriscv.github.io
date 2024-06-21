// import model 
import PEG from './pvm/parser.js'
import CPU from './pvm/cpu.js'


const vm = new CPU();


// assemble code
export function assemble() {
    let code = "";
    let quad_json = "";
    //document.getElementById("console").innerHTML = "";
    code = document.getElementById("code").value;
    try {
        vm.instructions = PEG.parse(code);
        quad_json = JSON.stringify(instr); 
        document.getElementById("console").value += quad_json+'\n$ ';
     } catch (e) {
        document.getElementById("console").value = e+'\n$ ';
    }
}

// run program
export function run() {

}

// load initial code
window.onload = function() {
    let input = "_start:\n\tlw t1, 10\n\tlw t2, 10\n\tadd t3, t1, t2\n\tmv t0, t3\n"
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
