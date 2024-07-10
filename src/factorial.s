.global _start

_start:
	li a0, 5
	jal factorial
	li a7, 93
	ecall
	
factorial:
	mv a1, a0
	li a2, 1
loop:
	addi a1, a1, -1
	beq a1, a2, endloop
	mul a0, a0, a1
	j loop
endloop:
	ret

