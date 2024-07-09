.global _start

.text
_start:
	li t0, 10
	li t1, 5
	add a0, t0, t1
	sub a1, t0, t1
	mul a2, t0, t1
	div a3, t0, t1

	li a7, 93
	ecall
