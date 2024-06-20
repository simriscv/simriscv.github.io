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




export function assemble() {
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

export function run() {

}



export function handler(e) {
  if (e.key === 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;

      // Modificar el valor del textarea para insertar un tab
      this.value = this.value.substring(0, start) +
          "\t" + this.value.substring(end);

      // Ajustar la posición del cursor
      this.selectionStart = this.selectionEnd = start + 1;
  }
}

// Agregar el evento keydown al elemento con id 'code'
document.getElementById('code').addEventListener('keydown', keydownHandler);

document.addEventListener('DOMContentLoaded', function() {
  // Obtener el botón por su id
  const loadButton = document.getElementById('loadButton');

  // Agregar un event listener para el evento click
  loadButton.addEventListener('click', function() {
      // Llamar a la función assemble al hacer clic en el botón
      assemble();
  });
});
