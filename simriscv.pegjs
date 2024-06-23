// Luis Espino
// 2024

{	let i = []; }

program = instructions { return i; }

instructions
	= instruction * 
		 
instruction
	// arithmetic R
	= _ op:"add "i rd:reg comma rs1:reg comma rs2:reg end
		{ i.push({ op: 51, f3: 0, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }); }
 	/ _ op:"sub "i rd:reg comma rs1:reg comma rs2:reg end
		{ i.push({ op: 51, f3: 0, f7: 32, rd:rd, rs1:rs1, rs2:rs2 }); }
	
	// arithmetic immediate I
	/ _ op:"addi "i rd:reg comma rs1:reg comma imm:imm end
		{ i.push({ op: 19, f3: 0, rd:rd, rs1:rs1, imm:imm }); }

	// logic R
	/ _ op:"and "i rd:reg comma rs1:reg comma rs2:reg end
		{ i.push({ op: 51, f3: 7, rd:rd, rs1:rs1, rs2:rs2 }); }
	/ _ op:"or "i rd:reg comma rs1:reg comma rs2:reg end
		{ i.push({ op: 51, f3: 6, rd:rd, rs1:rs1, rs2:rs2 }); }
	/ _ op:"xor "i rd:reg comma rs1:reg comma rs2:reg end
		{ i.push({ op: 51, f3: 4, rd:rd, rs1:rs1, rs2:rs2 }); }
	
	// logic immediate I
	/ _ op:"andi "i rd:reg comma rs1:reg comma imm:imm end
		{ i.push({ op: 19, f3: 7, rd:rd, rs1:rs1, imm:imm }); }
	/ _ op:"ori "i rd:reg comma rs1:reg comma imm:imm end
		{ i.push({ op: 19, f3: 6, rd:rd, rs1:rs1, imm:imm }); }
	/ _ op:"xori "i rd:reg comma rs1:reg comma imm:imm end
		{ i.push({ op: 19, f3: 4, rd:rd, rs1:rs1, imm:imm }); }

	// load I
	/ _ op:"lw "i rd:reg comma imm:imm end
		{ i.push({ op: 3, f3: 2, rd:rd, imm:imm }); }

	// store S
   	/ _ op:"sw "i rd:reg comma imm:imm end
		{ i.push({ op:35, f3:2, rd:rd, imm:imm }); }

	// move




	// pseudo
	/ _ op:"mv "i rd:reg comma rs1:reg end // addi imm=0
		{ i.push({ op:19, f3:0, rd:rd, rs1:rs1, imm:0 }); }
 	/ _ op:"li "i rd:reg comma imm:imm end // addi rs1=x0
		{ i.push({ op:19, f3:0, rd:rd, rs1:0, imm:imm }); }
	/ _ op:"nop"i _ end
 		{ i.push({ op:19, f3:0, rd:0, rs1:0, imm:0 }); }

	// directives
	/ __ ".global "i _ n:name _ end  	
 		{ i.push({ op:0, f3:1, name:n }); }

	// others
    / la:label 
		{ i.push({ op: 0, name: la }); }
	/ _ "ecall"i _ end
	/ end
	/ ___


reg "register"
	= _ ("zero"i/"x0"i/"r0"i) { return 0; }
    	/ _ ("ra"i/"x1"i/"r1"i) { return 1; }
    	/ _ ("sp"i/"x2"i/"r2"i) { return 2; }
    	/ _ ("gp"i/"x3"i/"r3"i) { return 3; }
    	/ _ ("tp"i/"x4"i/"r4"i) { return 4; }
		/ _ ("t0"i/"x5"i/"r5"i) { return 5; }
    	/ _ ("t1"i/"x6"i/"r6"i) { return 6; }
    	/ _ ("t2"i/"x7"i/"r7"i) { return 7; }
    	/ _ ("a0"i/"x10"i/"r10"i) { return 10; }
    	/ _ ("a1"i/"x11"i/"r11"i) { return 11; }
    	/ _ ("a2"i/"x12"i/"r12"i) { return 12; }
    	/ _ ("a3"i/"x13"i/"r13"i) { return 13; }
    	/ _ ("a4"i/"x14"i/"r14"i) { return 14; }
    	/ _ ("a5"i/"x15"i/"r15"i) { return 15; }
    	/ _ ("a6"i/"x16"i/"r16"i) { return 16; }
    	/ _ ("a7"i/"x17"i/"r17"i) { return 17; }
    	/ _ ("s2"i/"x18"i/"r18"i) { return 18; }
    	/ _ ("s3"i/"x19"i/"r19"i) { return 19; }
    	/ _ ("s4"i/"x20"i/"r20"i) { return 20; }
    	/ _ ("s5"i/"x21"i/"r21"i) { return 21; }
    	/ _ ("s6"i/"x22"i/"r22"i) { return 22; }
    	/ _ ("s7"i/"x23"i/"r23"i) { return 23; }
    	/ _ ("s8"i/"x24"i/"r24"i) { return 24; }
    	/ _ ("s9"i/"x25"i/"r25"i) { return 25; }
    	/ _ ("s10"i/"x26"i/"r26"i) { return 26; }
    	/ _ ("s11"i/"x27"i/"r27"i) { return 27; }
    	/ _ ("t3"i/"x28"i/"r28"i) { return 28; }
    	/ _ ("t4"i/"x29"i/"r29"i) { return 29; }
    	/ _ ("t5"i/"x30"i/"r30"i) { return 30; }
    	/ _ ("t6"i/"x31"i/"r31"i) { return 31; }




label "label"
	= __ n:name __ ":" __ { return n; }

name "name"
	= [A-Z_a-z][A-Z_a-z0-9]* { return text(); }

imm "signed immediate"
	= _ s:("-"/"+")? _ n:[0-9]+ 
    	{if(s) return parseInt(s + n.join("")); 
        else return parseInt(n.join(""));}

comma "comma"
	= _ "," 

end "newline"
	= _ "\n"
    
_ "ignored"
	= [ \t]*

__ "ignoredwithnewline"
	= [ \t\n]*

___ "ignoredwithnewlineempty"
	= [ \t\n]+
    
    