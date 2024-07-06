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
    updateConsole("run\n"+vm.output+"$ ");
    showRegisters();
    showStack();
}

// load initial code
window.onload = function() {
    loadFile("src/hello.s");
    //document.getElementById("code").value = input
    showRegisters();
    showStack();
};

function loadFile(filePath) {
    fetch(filePath)
    .then(response => {
      if (!response.ok) {
        return "Network response was not ok.";
      }
      return response.text(); 
    })
    .then(content => {
        document.getElementById("code").value = content;
    })
    .catch(error => {
      return "Error fetching the file.";
    });  
}


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


// show stack
function showStack() {
    const tableContainer = document.getElementById('stack-table');
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const indexHeader = document.createElement('th');
    indexHeader.textContent = 'Address';
    headerRow.appendChild(indexHeader);
    const contentHeader = document.createElement('th');
    contentHeader.textContent = 'Content';
    headerRow.appendChild(contentHeader);
    table.appendChild(headerRow);

    let view = new DataView(vm.stack);
    let a = 0;
    // load values
    for (let i = 0; i < vm.addr.length; i++) {
        const rowData = document.createElement('tr');
        const indexCell = document.createElement('td');
        indexCell.textContent = vm.addr[i];
        rowData.appendChild(indexCell);
        const contentCell = document.createElement('td');
        if (i<16) a = 2097135 + i;
        else a = i - 16;
        let str = "";
        let i8a = new Uint8Array(vm.stack.slice(a*8,a*8+8));
        for (let j of i8a) {
            let hex = j.toString(16).toUpperCase();
            while (hex.length < 2) hex = "0" + hex;
            str += hex
        }      
        contentCell.textContent = str;
        rowData.appendChild(contentCell);
        table.appendChild(rowData);
    }
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

function loadCode() {
    var selected = document.getElementById("options").value;

    switch (selected) {
        case "hello":
            loadFile("src/hello.s");
            break;
        case "arithmetic":
            loadFile("src/arithmetic.s");
            break;
    }
}

// keydown listener for tab handler
document.getElementById('code').addEventListener('keydown', tabHandler);


// keydown listener for delete and backspace handler
document.getElementById('console').addEventListener('keydown', delHandler);

document.addEventListener("DOMContentLoaded", function() {
    loadCode(); // Llamar a cambiarOpcion() al cargar la página para mostrar el resultado inicial
  });

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
