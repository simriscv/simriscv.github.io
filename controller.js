// import model 
import { StartRules, SyntaxError, parse } from './pvm/parser.mjs'
import CPU from './pvm/cpu.mjs'


const vm = new CPU();


// assemble code
export function assemble() {
    let code = "";
    let quad_json = "";
    updateConsole("assemble\n");
    code = document.getElementById("code").value;
    try {
        vm.instructions = parse(code);
        quad_json = JSON.stringify(vm.instructions); 
        updateConsole(quad_json+"\n$ ");
     } catch (e) {
        updateConsole(e+"\n$ ");
    }
}

// run program
export function run() {
    vm.run();
    updateConsole("run"+vm.output+"\n$ ");
    showRegisters();
}

// load initial code
window.onload = function() {
    let input = ".global _start\n\n_start:\n\tli t0, 15\n\tli t1, -2\n\tadd t2, t0, t1\n\tmv a0, t2\n\tli a7, 93\n\tecall\n"
    document.getElementById("code").value = input
    showRegisters();
};

function updateConsole(append) {
    let c = document.getElementById("console");
    const isScrolledToBottom = c.scrollTop + c.clientHeight >= c.scrollHeight - 20;
    c.value += append;
    if (isScrolledToBottom) c.scrollTop = c.scrollHeight;
}

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

// show register
function showRegisters() {
    const tableContainer = document.getElementById('registers-table');
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const indexHeader = document.createElement('th');
    indexHeader.textContent = 'Register';
    headerRow.appendChild(indexHeader);
    const aliasHeader = document.createElement('th');
    aliasHeader.textContent = 'Alias';
    headerRow.appendChild(aliasHeader);
    const contentHeader = document.createElement('th');
    contentHeader.textContent = 'Value';
    headerRow.appendChild(contentHeader);
    table.appendChild(headerRow);

    // load values
    for (let i = 0; i < vm.registers.length; i++) {
      const rowData = document.createElement('tr');
      const indexCell = document.createElement('td');
      indexCell.textContent = "x"+i;
      rowData.appendChild(indexCell);
      const aliasCell = document.createElement('td');
      aliasCell.textContent = vm.alias[i];
      rowData.appendChild(aliasCell);
      const contentCell = document.createElement('td');
      contentCell.textContent = vm.registers[i];
      rowData.appendChild(contentCell);
      table.appendChild(rowData);
    }
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
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

// run button listener
document.addEventListener('DOMContentLoaded', function() {
    const loadButton = document.getElementById('run');
    loadButton.addEventListener('click', function() {
        run();
    });
  });
