"use strict";


function peg$subclass(child, parent) {
  function C() { this.constructor = child; }
  C.prototype = parent.prototype;
  child.prototype = new C();
}

function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  // istanbul ignore next Check is a necessary evil to support older environments
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}

peg$subclass(peg$SyntaxError, Error);

function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) { return str; }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}

peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
      ? this.location.source.offset(s)
      : s;
    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = (last - s.column) || 1;
      str += "\n --> " + loc + "\n"
          + filler + " |\n"
          + offset_s.line + " | " + line + "\n"
          + filler + " | " + peg$padEnd("", s.column - 1, ' ')
          + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return "\"" + literalEscape(expectation.text) + "\"";
    },

    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part)
          ? classEscape(part[0]) + "-" + classEscape(part[1])
          : classEscape(part);
      });

      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },

    any: function() {
      return "any character";
    },

    end: function() {
      return "end of input";
    },

    other: function(expectation) {
      return expectation.description;
    }
  };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/"/g,  "\\\"")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\^/g, "\\^")
      .replace(/-/g,  "\\-")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = expected.map(describeExpectation);
    var i, j;

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== undefined ? options : {};

  var peg$FAILED = {};
  var peg$source = options.grammarSource;

  var peg$startRuleFunctions = { program: peg$parseprogram };
  var peg$startRuleFunction = peg$parseprogram;

  var peg$c0 = "add ";
  var peg$c1 = "sub ";
  var peg$c2 = "addi ";
  var peg$c3 = "and ";
  var peg$c4 = "or ";
  var peg$c5 = "xor ";
  var peg$c6 = "andi ";
  var peg$c7 = "ori ";
  var peg$c8 = "xori ";
  var peg$c9 = "lw ";
  var peg$c10 = "st ";
  var peg$c11 = "mv ";
  var peg$c12 = "nop";
  var peg$c13 = "ret";
  var peg$c14 = "zero";
  var peg$c15 = "x0";
  var peg$c16 = "r0";
  var peg$c17 = "ra";
  var peg$c18 = "x1";
  var peg$c19 = "r1";
  var peg$c20 = "sp";
  var peg$c21 = "x2";
  var peg$c22 = "r2";
  var peg$c23 = "gp";
  var peg$c24 = "x3";
  var peg$c25 = "r3";
  var peg$c26 = "tp";
  var peg$c27 = "x4";
  var peg$c28 = "r4";
  var peg$c29 = "t0";
  var peg$c30 = "x5";
  var peg$c31 = "r5";
  var peg$c32 = "t1";
  var peg$c33 = "x6";
  var peg$c34 = "r6";
  var peg$c35 = "t2";
  var peg$c36 = "x7";
  var peg$c37 = "r7";
  var peg$c38 = "a0";
  var peg$c39 = "x10";
  var peg$c40 = "r10";
  var peg$c41 = "a1";
  var peg$c42 = "x11";
  var peg$c43 = "r11";
  var peg$c44 = "a2";
  var peg$c45 = "x12";
  var peg$c46 = "r12";
  var peg$c47 = "a3";
  var peg$c48 = "x13";
  var peg$c49 = "r13";
  var peg$c50 = "a4";
  var peg$c51 = "x14";
  var peg$c52 = "r14";
  var peg$c53 = "a5";
  var peg$c54 = "x15";
  var peg$c55 = "r15";
  var peg$c56 = "a6";
  var peg$c57 = "x16";
  var peg$c58 = "r16";
  var peg$c59 = "a7";
  var peg$c60 = "x17";
  var peg$c61 = "r17";
  var peg$c62 = "s2";
  var peg$c63 = "x18";
  var peg$c64 = "r18";
  var peg$c65 = "s3";
  var peg$c66 = "x19";
  var peg$c67 = "r19";
  var peg$c68 = "s4";
  var peg$c69 = "x20";
  var peg$c70 = "r20";
  var peg$c71 = "s5";
  var peg$c72 = "x21";
  var peg$c73 = "r21";
  var peg$c74 = "s6";
  var peg$c75 = "x22";
  var peg$c76 = "r22";
  var peg$c77 = "s7";
  var peg$c78 = "x23";
  var peg$c79 = "r23";
  var peg$c80 = "s8";
  var peg$c81 = "x24";
  var peg$c82 = "r24";
  var peg$c83 = "s9";
  var peg$c84 = "x25";
  var peg$c85 = "r25";
  var peg$c86 = "s10";
  var peg$c87 = "x26";
  var peg$c88 = "r26";
  var peg$c89 = "s11";
  var peg$c90 = "x27";
  var peg$c91 = "r27";
  var peg$c92 = "t3";
  var peg$c93 = "x28";
  var peg$c94 = "r28";
  var peg$c95 = "t4";
  var peg$c96 = "x29";
  var peg$c97 = "r29";
  var peg$c98 = "t5";
  var peg$c99 = "x30";
  var peg$c100 = "r30";
  var peg$c101 = "t6";
  var peg$c102 = "x31";
  var peg$c103 = "r31";
  var peg$c104 = ":";
  var peg$c105 = ",";
  var peg$c106 = "\n";

  var peg$r0 = /^[A-Z_a-z]/;
  var peg$r1 = /^[A-Z_a-z0-9]/;
  var peg$r2 = /^[0-9]/;
  var peg$r3 = /^[ \t]/;
  var peg$r4 = /^[ \t\n]/;

  var peg$e0 = peg$literalExpectation("add ", true);
  var peg$e1 = peg$literalExpectation("sub ", true);
  var peg$e2 = peg$literalExpectation("addi ", true);
  var peg$e3 = peg$literalExpectation("and ", true);
  var peg$e4 = peg$literalExpectation("or ", true);
  var peg$e5 = peg$literalExpectation("xor ", true);
  var peg$e6 = peg$literalExpectation("andi ", true);
  var peg$e7 = peg$literalExpectation("ori ", true);
  var peg$e8 = peg$literalExpectation("xori ", true);
  var peg$e9 = peg$literalExpectation("lw ", true);
  var peg$e10 = peg$literalExpectation("st ", true);
  var peg$e11 = peg$literalExpectation("mv ", true);
  var peg$e12 = peg$literalExpectation("nop", true);
  var peg$e13 = peg$literalExpectation("ret", true);
  var peg$e14 = peg$otherExpectation("register");
  var peg$e15 = peg$literalExpectation("zero", true);
  var peg$e16 = peg$literalExpectation("x0", true);
  var peg$e17 = peg$literalExpectation("r0", true);
  var peg$e18 = peg$literalExpectation("ra", true);
  var peg$e19 = peg$literalExpectation("x1", true);
  var peg$e20 = peg$literalExpectation("r1", true);
  var peg$e21 = peg$literalExpectation("sp", true);
  var peg$e22 = peg$literalExpectation("x2", true);
  var peg$e23 = peg$literalExpectation("r2", true);
  var peg$e24 = peg$literalExpectation("gp", true);
  var peg$e25 = peg$literalExpectation("x3", true);
  var peg$e26 = peg$literalExpectation("r3", true);
  var peg$e27 = peg$literalExpectation("tp", true);
  var peg$e28 = peg$literalExpectation("x4", true);
  var peg$e29 = peg$literalExpectation("r4", true);
  var peg$e30 = peg$literalExpectation("t0", true);
  var peg$e31 = peg$literalExpectation("x5", true);
  var peg$e32 = peg$literalExpectation("r5", true);
  var peg$e33 = peg$literalExpectation("t1", true);
  var peg$e34 = peg$literalExpectation("x6", true);
  var peg$e35 = peg$literalExpectation("r6", true);
  var peg$e36 = peg$literalExpectation("t2", true);
  var peg$e37 = peg$literalExpectation("x7", true);
  var peg$e38 = peg$literalExpectation("r7", true);
  var peg$e39 = peg$literalExpectation("a0", true);
  var peg$e40 = peg$literalExpectation("x10", true);
  var peg$e41 = peg$literalExpectation("r10", true);
  var peg$e42 = peg$literalExpectation("a1", true);
  var peg$e43 = peg$literalExpectation("x11", true);
  var peg$e44 = peg$literalExpectation("r11", true);
  var peg$e45 = peg$literalExpectation("a2", true);
  var peg$e46 = peg$literalExpectation("x12", true);
  var peg$e47 = peg$literalExpectation("r12", true);
  var peg$e48 = peg$literalExpectation("a3", true);
  var peg$e49 = peg$literalExpectation("x13", true);
  var peg$e50 = peg$literalExpectation("r13", true);
  var peg$e51 = peg$literalExpectation("a4", true);
  var peg$e52 = peg$literalExpectation("x14", true);
  var peg$e53 = peg$literalExpectation("r14", true);
  var peg$e54 = peg$literalExpectation("a5", true);
  var peg$e55 = peg$literalExpectation("x15", true);
  var peg$e56 = peg$literalExpectation("r15", true);
  var peg$e57 = peg$literalExpectation("a6", true);
  var peg$e58 = peg$literalExpectation("x16", true);
  var peg$e59 = peg$literalExpectation("r16", true);
  var peg$e60 = peg$literalExpectation("a7", true);
  var peg$e61 = peg$literalExpectation("x17", true);
  var peg$e62 = peg$literalExpectation("r17", true);
  var peg$e63 = peg$literalExpectation("s2", true);
  var peg$e64 = peg$literalExpectation("x18", true);
  var peg$e65 = peg$literalExpectation("r18", true);
  var peg$e66 = peg$literalExpectation("s3", true);
  var peg$e67 = peg$literalExpectation("x19", true);
  var peg$e68 = peg$literalExpectation("r19", true);
  var peg$e69 = peg$literalExpectation("s4", true);
  var peg$e70 = peg$literalExpectation("x20", true);
  var peg$e71 = peg$literalExpectation("r20", true);
  var peg$e72 = peg$literalExpectation("s5", true);
  var peg$e73 = peg$literalExpectation("x21", true);
  var peg$e74 = peg$literalExpectation("r21", true);
  var peg$e75 = peg$literalExpectation("s6", true);
  var peg$e76 = peg$literalExpectation("x22", true);
  var peg$e77 = peg$literalExpectation("r22", true);
  var peg$e78 = peg$literalExpectation("s7", true);
  var peg$e79 = peg$literalExpectation("x23", true);
  var peg$e80 = peg$literalExpectation("r23", true);
  var peg$e81 = peg$literalExpectation("s8", true);
  var peg$e82 = peg$literalExpectation("x24", true);
  var peg$e83 = peg$literalExpectation("r24", true);
  var peg$e84 = peg$literalExpectation("s9", true);
  var peg$e85 = peg$literalExpectation("x25", true);
  var peg$e86 = peg$literalExpectation("r25", true);
  var peg$e87 = peg$literalExpectation("s10", true);
  var peg$e88 = peg$literalExpectation("x26", true);
  var peg$e89 = peg$literalExpectation("r26", true);
  var peg$e90 = peg$literalExpectation("s11", true);
  var peg$e91 = peg$literalExpectation("x27", true);
  var peg$e92 = peg$literalExpectation("r27", true);
  var peg$e93 = peg$literalExpectation("t3", true);
  var peg$e94 = peg$literalExpectation("x28", true);
  var peg$e95 = peg$literalExpectation("r28", true);
  var peg$e96 = peg$literalExpectation("t4", true);
  var peg$e97 = peg$literalExpectation("x29", true);
  var peg$e98 = peg$literalExpectation("r29", true);
  var peg$e99 = peg$literalExpectation("t5", true);
  var peg$e100 = peg$literalExpectation("x30", true);
  var peg$e101 = peg$literalExpectation("r30", true);
  var peg$e102 = peg$literalExpectation("t6", true);
  var peg$e103 = peg$literalExpectation("x31", true);
  var peg$e104 = peg$literalExpectation("r31", true);
  var peg$e105 = peg$otherExpectation("label");
  var peg$e106 = peg$literalExpectation(":", false);
  var peg$e107 = peg$otherExpectation("name");
  var peg$e108 = peg$classExpectation([["A", "Z"], "_", ["a", "z"]], false, false);
  var peg$e109 = peg$classExpectation([["A", "Z"], "_", ["a", "z"], ["0", "9"]], false, false);
  var peg$e110 = peg$otherExpectation("integer");
  var peg$e111 = peg$classExpectation([["0", "9"]], false, false);
  var peg$e112 = peg$otherExpectation("comma");
  var peg$e113 = peg$literalExpectation(",", false);
  var peg$e114 = peg$otherExpectation("newline");
  var peg$e115 = peg$literalExpectation("\n", false);
  var peg$e116 = peg$otherExpectation("ignored");
  var peg$e117 = peg$classExpectation([" ", "\t"], false, false);
  var peg$e118 = peg$otherExpectation("ignoredwithnewline");
  var peg$e119 = peg$classExpectation([" ", "\t", "\n"], false, false);

  var peg$f0 = function() { return i; };
  var peg$f1 = function(op, rd, rs1, rs2) { i.push({ op: "add", rd:rd, rs1:rs1, rs2:rs2 }); };
  var peg$f2 = function(op, rd, rs1, rs2) { i.push({ op: "sub", rd:rd, rs1:rs1, rs2:rs2 }); };
  var peg$f3 = function(op, rd, rs1, imm) { i.push({ op: "addi", rd:rd, rs1:rs1, imm:imm }); };
  var peg$f4 = function(op, rd, rs1, rs2) { i.push({ op: "and", rd:rd, rs1:rs1, rs2:rs2 }); };
  var peg$f5 = function(op, rd, rs1, rs2) { i.push({ op: "or", rd:rd, rs1:rs1, rs2:rs2 }); };
  var peg$f6 = function(op, rd, rs1, rs2) { i.push({ op: "xor", rd:rd, rs1:rs1, rs2:rs2 }); };
  var peg$f7 = function(op, rd, rs1, imm) { i.push({ op: "andi", rd:rd, rs1:rs1, imm:imm }); };
  var peg$f8 = function(op, rd, rs1, imm) { i.push({ op: "ori", rd:rd, rs1:rs1, imm:imm }); };
  var peg$f9 = function(op, rd, rs1, imm) { i.push({ op: "xori", rd:rd, rs1:rs1, imm:imm }); };
  var peg$f10 = function(op, rd, imm) { i.push({ op: "lw", rd:rd, imm:imm }); };
  var peg$f11 = function(op, rd, imm) { i.push({ op: "st", rd:rd, imm:imm }); };
  var peg$f12 = function(op, rd, rs) { i.push({ op: "mv", rd:rd, rs:rs }); };
  var peg$f13 = function(op) { i.push({ op: "nop" }); };
  var peg$f14 = function(op) { i.push({ op: "ret" }); };
  var peg$f15 = function(la) { i.push({ op: "label", name: la }); };
  var peg$f16 = function() { return 0; };
  var peg$f17 = function() { return 1; };
  var peg$f18 = function() { return 2; };
  var peg$f19 = function() { return 3; };
  var peg$f20 = function() { return 4; };
  var peg$f21 = function() { return 5; };
  var peg$f22 = function() { return 6; };
  var peg$f23 = function() { return 7; };
  var peg$f24 = function() { return 10; };
  var peg$f25 = function() { return 11; };
  var peg$f26 = function() { return 12; };
  var peg$f27 = function() { return 13; };
  var peg$f28 = function() { return 14; };
  var peg$f29 = function() { return 15; };
  var peg$f30 = function() { return 16; };
  var peg$f31 = function() { return 17; };
  var peg$f32 = function() { return 18; };
  var peg$f33 = function() { return 19; };
  var peg$f34 = function() { return 20; };
  var peg$f35 = function() { return 21; };
  var peg$f36 = function() { return 22; };
  var peg$f37 = function() { return 23; };
  var peg$f38 = function() { return 24; };
  var peg$f39 = function() { return 25; };
  var peg$f40 = function() { return 26; };
  var peg$f41 = function() { return 27; };
  var peg$f42 = function() { return 28; };
  var peg$f43 = function() { return 29; };
  var peg$f44 = function() { return 30; };
  var peg$f45 = function() { return 31; };
  var peg$f46 = function(n) { return n; };
  var peg$f47 = function() { return text(); };
  var peg$f48 = function(i) { return parseInt(i.join(""));};
  var peg$currPos = options.peg$currPos | 0;
  var peg$savedPos = peg$currPos;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = peg$currPos;
  var peg$maxFailExpected = options.peg$maxFailExpected || [];
  var peg$silentFails = options.peg$silentFails | 0;

  var peg$result;

  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function offset() {
    return peg$savedPos;
  }

  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;

    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {}
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;

      return details;
    }
  }

  function peg$computeLocation(startPos, endPos, offset) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);

    var res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset && peg$source && (typeof peg$source.offset === "function")) {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parseprogram() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseinstructions();
    peg$savedPos = s0;
    s1 = peg$f0();
    s0 = s1;

    return s0;
  }

  function peg$parseinstructions() {
    var s0, s1;

    s0 = [];
    s1 = peg$parseinstruction();
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = peg$parseinstruction();
    }

    return s0;
  }

  function peg$parseinstruction() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    s1 = peg$parse_();
    s2 = input.substr(peg$currPos, 4);
    if (s2.toLowerCase() === peg$c0) {
      peg$currPos += 4;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e0); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsereg();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsecomma();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsereg();
          if (s5 !== peg$FAILED) {
            s6 = peg$parsecomma();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsereg();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseend();
                if (s8 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f1(s2, s3, s5, s7);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse_();
      s2 = input.substr(peg$currPos, 4);
      if (s2.toLowerCase() === peg$c1) {
        peg$currPos += 4;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e1); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsereg();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsecomma();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsereg();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsecomma();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsereg();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseend();
                  if (s8 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f2(s2, s3, s5, s7);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        s2 = input.substr(peg$currPos, 5);
        if (s2.toLowerCase() === peg$c2) {
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e2); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsereg();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsecomma();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsereg();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsecomma();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseimm();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseend();
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f3(s2, s3, s5, s7);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          s2 = input.substr(peg$currPos, 4);
          if (s2.toLowerCase() === peg$c3) {
            peg$currPos += 4;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e3); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsereg();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsecomma();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsereg();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsecomma();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsereg();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parseend();
                      if (s8 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f4(s2, s3, s5, s7);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            s2 = input.substr(peg$currPos, 3);
            if (s2.toLowerCase() === peg$c4) {
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e4); }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsereg();
              if (s3 !== peg$FAILED) {
                s4 = peg$parsecomma();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsereg();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsecomma();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsereg();
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parseend();
                        if (s8 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f5(s2, s3, s5, s7);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parse_();
              s2 = input.substr(peg$currPos, 4);
              if (s2.toLowerCase() === peg$c5) {
                peg$currPos += 4;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e5); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsereg();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsecomma();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsereg();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsecomma();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsereg();
                        if (s7 !== peg$FAILED) {
                          s8 = peg$parseend();
                          if (s8 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f6(s2, s3, s5, s7);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parse_();
                s2 = input.substr(peg$currPos, 5);
                if (s2.toLowerCase() === peg$c6) {
                  peg$currPos += 5;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e6); }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parsereg();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parsecomma();
                    if (s4 !== peg$FAILED) {
                      s5 = peg$parsereg();
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parsecomma();
                        if (s6 !== peg$FAILED) {
                          s7 = peg$parseimm();
                          if (s7 !== peg$FAILED) {
                            s8 = peg$parseend();
                            if (s8 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s0 = peg$f7(s2, s3, s5, s7);
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parse_();
                  s2 = input.substr(peg$currPos, 4);
                  if (s2.toLowerCase() === peg$c7) {
                    peg$currPos += 4;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e7); }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsereg();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parsecomma();
                      if (s4 !== peg$FAILED) {
                        s5 = peg$parsereg();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsecomma();
                          if (s6 !== peg$FAILED) {
                            s7 = peg$parseimm();
                            if (s7 !== peg$FAILED) {
                              s8 = peg$parseend();
                              if (s8 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f8(s2, s3, s5, s7);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parse_();
                    s2 = input.substr(peg$currPos, 5);
                    if (s2.toLowerCase() === peg$c8) {
                      peg$currPos += 5;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e8); }
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsereg();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$parsecomma();
                        if (s4 !== peg$FAILED) {
                          s5 = peg$parsereg();
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parsecomma();
                            if (s6 !== peg$FAILED) {
                              s7 = peg$parseimm();
                              if (s7 !== peg$FAILED) {
                                s8 = peg$parseend();
                                if (s8 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s0 = peg$f9(s2, s3, s5, s7);
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parse_();
                      s2 = input.substr(peg$currPos, 3);
                      if (s2.toLowerCase() === peg$c9) {
                        peg$currPos += 3;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$e9); }
                      }
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parsereg();
                        if (s3 !== peg$FAILED) {
                          s4 = peg$parsecomma();
                          if (s4 !== peg$FAILED) {
                            s5 = peg$parseimm();
                            if (s5 !== peg$FAILED) {
                              s6 = peg$parseend();
                              if (s6 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f10(s2, s3, s5);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parse_();
                        s2 = input.substr(peg$currPos, 3);
                        if (s2.toLowerCase() === peg$c10) {
                          peg$currPos += 3;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$e10); }
                        }
                        if (s2 !== peg$FAILED) {
                          s3 = peg$parsereg();
                          if (s3 !== peg$FAILED) {
                            s4 = peg$parsecomma();
                            if (s4 !== peg$FAILED) {
                              s5 = peg$parseimm();
                              if (s5 !== peg$FAILED) {
                                s6 = peg$parseend();
                                if (s6 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s0 = peg$f11(s2, s3, s5);
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          s1 = peg$parse_();
                          s2 = input.substr(peg$currPos, 3);
                          if (s2.toLowerCase() === peg$c11) {
                            peg$currPos += 3;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$e11); }
                          }
                          if (s2 !== peg$FAILED) {
                            s3 = peg$parsereg();
                            if (s3 !== peg$FAILED) {
                              s4 = peg$parsecomma();
                              if (s4 !== peg$FAILED) {
                                s5 = peg$parsereg();
                                if (s5 !== peg$FAILED) {
                                  s6 = peg$parseend();
                                  if (s6 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f12(s2, s3, s5);
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parse_();
                            s2 = input.substr(peg$currPos, 3);
                            if (s2.toLowerCase() === peg$c12) {
                              peg$currPos += 3;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$e12); }
                            }
                            if (s2 !== peg$FAILED) {
                              s3 = peg$parse_();
                              s4 = peg$parseend();
                              if (s4 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f13(s2);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              s1 = peg$parse_();
                              s2 = input.substr(peg$currPos, 3);
                              if (s2.toLowerCase() === peg$c13) {
                                peg$currPos += 3;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$e13); }
                              }
                              if (s2 !== peg$FAILED) {
                                s3 = peg$parse_();
                                s4 = peg$parseend();
                                if (s4 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s0 = peg$f14(s2);
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = peg$parselabel();
                                if (s1 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$f15(s1);
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                  s0 = peg$parseend();
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsereg() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parse_();
    s2 = input.substr(peg$currPos, 4);
    if (s2.toLowerCase() === peg$c14) {
      peg$currPos += 4;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e15); }
    }
    if (s2 === peg$FAILED) {
      s2 = input.substr(peg$currPos, 2);
      if (s2.toLowerCase() === peg$c15) {
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e16); }
      }
      if (s2 === peg$FAILED) {
        s2 = input.substr(peg$currPos, 2);
        if (s2.toLowerCase() === peg$c16) {
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e17); }
        }
      }
    }
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f16();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse_();
      s2 = input.substr(peg$currPos, 2);
      if (s2.toLowerCase() === peg$c17) {
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e18); }
      }
      if (s2 === peg$FAILED) {
        s2 = input.substr(peg$currPos, 2);
        if (s2.toLowerCase() === peg$c18) {
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e19); }
        }
        if (s2 === peg$FAILED) {
          s2 = input.substr(peg$currPos, 2);
          if (s2.toLowerCase() === peg$c19) {
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e20); }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f17();
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        s2 = input.substr(peg$currPos, 2);
        if (s2.toLowerCase() === peg$c20) {
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e21); }
        }
        if (s2 === peg$FAILED) {
          s2 = input.substr(peg$currPos, 2);
          if (s2.toLowerCase() === peg$c21) {
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e22); }
          }
          if (s2 === peg$FAILED) {
            s2 = input.substr(peg$currPos, 2);
            if (s2.toLowerCase() === peg$c22) {
              peg$currPos += 2;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e23); }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f18();
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          s2 = input.substr(peg$currPos, 2);
          if (s2.toLowerCase() === peg$c23) {
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e24); }
          }
          if (s2 === peg$FAILED) {
            s2 = input.substr(peg$currPos, 2);
            if (s2.toLowerCase() === peg$c24) {
              peg$currPos += 2;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e25); }
            }
            if (s2 === peg$FAILED) {
              s2 = input.substr(peg$currPos, 2);
              if (s2.toLowerCase() === peg$c25) {
                peg$currPos += 2;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e26); }
              }
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f19();
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            s2 = input.substr(peg$currPos, 2);
            if (s2.toLowerCase() === peg$c26) {
              peg$currPos += 2;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e27); }
            }
            if (s2 === peg$FAILED) {
              s2 = input.substr(peg$currPos, 2);
              if (s2.toLowerCase() === peg$c27) {
                peg$currPos += 2;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e28); }
              }
              if (s2 === peg$FAILED) {
                s2 = input.substr(peg$currPos, 2);
                if (s2.toLowerCase() === peg$c28) {
                  peg$currPos += 2;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e29); }
                }
              }
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f20();
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parse_();
              s2 = input.substr(peg$currPos, 2);
              if (s2.toLowerCase() === peg$c29) {
                peg$currPos += 2;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e30); }
              }
              if (s2 === peg$FAILED) {
                s2 = input.substr(peg$currPos, 2);
                if (s2.toLowerCase() === peg$c30) {
                  peg$currPos += 2;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e31); }
                }
                if (s2 === peg$FAILED) {
                  s2 = input.substr(peg$currPos, 2);
                  if (s2.toLowerCase() === peg$c31) {
                    peg$currPos += 2;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e32); }
                  }
                }
              }
              if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f21();
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parse_();
                s2 = input.substr(peg$currPos, 2);
                if (s2.toLowerCase() === peg$c32) {
                  peg$currPos += 2;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e33); }
                }
                if (s2 === peg$FAILED) {
                  s2 = input.substr(peg$currPos, 2);
                  if (s2.toLowerCase() === peg$c33) {
                    peg$currPos += 2;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e34); }
                  }
                  if (s2 === peg$FAILED) {
                    s2 = input.substr(peg$currPos, 2);
                    if (s2.toLowerCase() === peg$c34) {
                      peg$currPos += 2;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e35); }
                    }
                  }
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f22();
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parse_();
                  s2 = input.substr(peg$currPos, 2);
                  if (s2.toLowerCase() === peg$c35) {
                    peg$currPos += 2;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e36); }
                  }
                  if (s2 === peg$FAILED) {
                    s2 = input.substr(peg$currPos, 2);
                    if (s2.toLowerCase() === peg$c36) {
                      peg$currPos += 2;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e37); }
                    }
                    if (s2 === peg$FAILED) {
                      s2 = input.substr(peg$currPos, 2);
                      if (s2.toLowerCase() === peg$c37) {
                        peg$currPos += 2;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$e38); }
                      }
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f23();
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parse_();
                    s2 = input.substr(peg$currPos, 2);
                    if (s2.toLowerCase() === peg$c38) {
                      peg$currPos += 2;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e39); }
                    }
                    if (s2 === peg$FAILED) {
                      s2 = input.substr(peg$currPos, 3);
                      if (s2.toLowerCase() === peg$c39) {
                        peg$currPos += 3;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$e40); }
                      }
                      if (s2 === peg$FAILED) {
                        s2 = input.substr(peg$currPos, 3);
                        if (s2.toLowerCase() === peg$c40) {
                          peg$currPos += 3;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$e41); }
                        }
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f24();
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parse_();
                      s2 = input.substr(peg$currPos, 2);
                      if (s2.toLowerCase() === peg$c41) {
                        peg$currPos += 2;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$e42); }
                      }
                      if (s2 === peg$FAILED) {
                        s2 = input.substr(peg$currPos, 3);
                        if (s2.toLowerCase() === peg$c42) {
                          peg$currPos += 3;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$e43); }
                        }
                        if (s2 === peg$FAILED) {
                          s2 = input.substr(peg$currPos, 3);
                          if (s2.toLowerCase() === peg$c43) {
                            peg$currPos += 3;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$e44); }
                          }
                        }
                      }
                      if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f25();
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parse_();
                        s2 = input.substr(peg$currPos, 2);
                        if (s2.toLowerCase() === peg$c44) {
                          peg$currPos += 2;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$e45); }
                        }
                        if (s2 === peg$FAILED) {
                          s2 = input.substr(peg$currPos, 3);
                          if (s2.toLowerCase() === peg$c45) {
                            peg$currPos += 3;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$e46); }
                          }
                          if (s2 === peg$FAILED) {
                            s2 = input.substr(peg$currPos, 3);
                            if (s2.toLowerCase() === peg$c46) {
                              peg$currPos += 3;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$e47); }
                            }
                          }
                        }
                        if (s2 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f26();
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          s1 = peg$parse_();
                          s2 = input.substr(peg$currPos, 2);
                          if (s2.toLowerCase() === peg$c47) {
                            peg$currPos += 2;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$e48); }
                          }
                          if (s2 === peg$FAILED) {
                            s2 = input.substr(peg$currPos, 3);
                            if (s2.toLowerCase() === peg$c48) {
                              peg$currPos += 3;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$e49); }
                            }
                            if (s2 === peg$FAILED) {
                              s2 = input.substr(peg$currPos, 3);
                              if (s2.toLowerCase() === peg$c49) {
                                peg$currPos += 3;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$e50); }
                              }
                            }
                          }
                          if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f27();
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parse_();
                            s2 = input.substr(peg$currPos, 2);
                            if (s2.toLowerCase() === peg$c50) {
                              peg$currPos += 2;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$e51); }
                            }
                            if (s2 === peg$FAILED) {
                              s2 = input.substr(peg$currPos, 3);
                              if (s2.toLowerCase() === peg$c51) {
                                peg$currPos += 3;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$e52); }
                              }
                              if (s2 === peg$FAILED) {
                                s2 = input.substr(peg$currPos, 3);
                                if (s2.toLowerCase() === peg$c52) {
                                  peg$currPos += 3;
                                } else {
                                  s2 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$e53); }
                                }
                              }
                            }
                            if (s2 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s0 = peg$f28();
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              s1 = peg$parse_();
                              s2 = input.substr(peg$currPos, 2);
                              if (s2.toLowerCase() === peg$c53) {
                                peg$currPos += 2;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$e54); }
                              }
                              if (s2 === peg$FAILED) {
                                s2 = input.substr(peg$currPos, 3);
                                if (s2.toLowerCase() === peg$c54) {
                                  peg$currPos += 3;
                                } else {
                                  s2 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$e55); }
                                }
                                if (s2 === peg$FAILED) {
                                  s2 = input.substr(peg$currPos, 3);
                                  if (s2.toLowerCase() === peg$c55) {
                                    peg$currPos += 3;
                                  } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$e56); }
                                  }
                                }
                              }
                              if (s2 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f29();
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = peg$parse_();
                                s2 = input.substr(peg$currPos, 2);
                                if (s2.toLowerCase() === peg$c56) {
                                  peg$currPos += 2;
                                } else {
                                  s2 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$e57); }
                                }
                                if (s2 === peg$FAILED) {
                                  s2 = input.substr(peg$currPos, 3);
                                  if (s2.toLowerCase() === peg$c57) {
                                    peg$currPos += 3;
                                  } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$e58); }
                                  }
                                  if (s2 === peg$FAILED) {
                                    s2 = input.substr(peg$currPos, 3);
                                    if (s2.toLowerCase() === peg$c58) {
                                      peg$currPos += 3;
                                    } else {
                                      s2 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$e59); }
                                    }
                                  }
                                }
                                if (s2 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s0 = peg$f30();
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  s1 = peg$parse_();
                                  s2 = input.substr(peg$currPos, 2);
                                  if (s2.toLowerCase() === peg$c59) {
                                    peg$currPos += 2;
                                  } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$e60); }
                                  }
                                  if (s2 === peg$FAILED) {
                                    s2 = input.substr(peg$currPos, 3);
                                    if (s2.toLowerCase() === peg$c60) {
                                      peg$currPos += 3;
                                    } else {
                                      s2 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$e61); }
                                    }
                                    if (s2 === peg$FAILED) {
                                      s2 = input.substr(peg$currPos, 3);
                                      if (s2.toLowerCase() === peg$c61) {
                                        peg$currPos += 3;
                                      } else {
                                        s2 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$e62); }
                                      }
                                    }
                                  }
                                  if (s2 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f31();
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    s1 = peg$parse_();
                                    s2 = input.substr(peg$currPos, 2);
                                    if (s2.toLowerCase() === peg$c62) {
                                      peg$currPos += 2;
                                    } else {
                                      s2 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$e63); }
                                    }
                                    if (s2 === peg$FAILED) {
                                      s2 = input.substr(peg$currPos, 3);
                                      if (s2.toLowerCase() === peg$c63) {
                                        peg$currPos += 3;
                                      } else {
                                        s2 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$e64); }
                                      }
                                      if (s2 === peg$FAILED) {
                                        s2 = input.substr(peg$currPos, 3);
                                        if (s2.toLowerCase() === peg$c64) {
                                          peg$currPos += 3;
                                        } else {
                                          s2 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$e65); }
                                        }
                                      }
                                    }
                                    if (s2 !== peg$FAILED) {
                                      peg$savedPos = s0;
                                      s0 = peg$f32();
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      s1 = peg$parse_();
                                      s2 = input.substr(peg$currPos, 2);
                                      if (s2.toLowerCase() === peg$c65) {
                                        peg$currPos += 2;
                                      } else {
                                        s2 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$e66); }
                                      }
                                      if (s2 === peg$FAILED) {
                                        s2 = input.substr(peg$currPos, 3);
                                        if (s2.toLowerCase() === peg$c66) {
                                          peg$currPos += 3;
                                        } else {
                                          s2 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$e67); }
                                        }
                                        if (s2 === peg$FAILED) {
                                          s2 = input.substr(peg$currPos, 3);
                                          if (s2.toLowerCase() === peg$c67) {
                                            peg$currPos += 3;
                                          } else {
                                            s2 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$e68); }
                                          }
                                        }
                                      }
                                      if (s2 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s0 = peg$f33();
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        s1 = peg$parse_();
                                        s2 = input.substr(peg$currPos, 2);
                                        if (s2.toLowerCase() === peg$c68) {
                                          peg$currPos += 2;
                                        } else {
                                          s2 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$e69); }
                                        }
                                        if (s2 === peg$FAILED) {
                                          s2 = input.substr(peg$currPos, 3);
                                          if (s2.toLowerCase() === peg$c69) {
                                            peg$currPos += 3;
                                          } else {
                                            s2 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$e70); }
                                          }
                                          if (s2 === peg$FAILED) {
                                            s2 = input.substr(peg$currPos, 3);
                                            if (s2.toLowerCase() === peg$c70) {
                                              peg$currPos += 3;
                                            } else {
                                              s2 = peg$FAILED;
                                              if (peg$silentFails === 0) { peg$fail(peg$e71); }
                                            }
                                          }
                                        }
                                        if (s2 !== peg$FAILED) {
                                          peg$savedPos = s0;
                                          s0 = peg$f34();
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$currPos;
                                          s1 = peg$parse_();
                                          s2 = input.substr(peg$currPos, 2);
                                          if (s2.toLowerCase() === peg$c71) {
                                            peg$currPos += 2;
                                          } else {
                                            s2 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$e72); }
                                          }
                                          if (s2 === peg$FAILED) {
                                            s2 = input.substr(peg$currPos, 3);
                                            if (s2.toLowerCase() === peg$c72) {
                                              peg$currPos += 3;
                                            } else {
                                              s2 = peg$FAILED;
                                              if (peg$silentFails === 0) { peg$fail(peg$e73); }
                                            }
                                            if (s2 === peg$FAILED) {
                                              s2 = input.substr(peg$currPos, 3);
                                              if (s2.toLowerCase() === peg$c73) {
                                                peg$currPos += 3;
                                              } else {
                                                s2 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$e74); }
                                              }
                                            }
                                          }
                                          if (s2 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s0 = peg$f35();
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            s1 = peg$parse_();
                                            s2 = input.substr(peg$currPos, 2);
                                            if (s2.toLowerCase() === peg$c74) {
                                              peg$currPos += 2;
                                            } else {
                                              s2 = peg$FAILED;
                                              if (peg$silentFails === 0) { peg$fail(peg$e75); }
                                            }
                                            if (s2 === peg$FAILED) {
                                              s2 = input.substr(peg$currPos, 3);
                                              if (s2.toLowerCase() === peg$c75) {
                                                peg$currPos += 3;
                                              } else {
                                                s2 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$e76); }
                                              }
                                              if (s2 === peg$FAILED) {
                                                s2 = input.substr(peg$currPos, 3);
                                                if (s2.toLowerCase() === peg$c76) {
                                                  peg$currPos += 3;
                                                } else {
                                                  s2 = peg$FAILED;
                                                  if (peg$silentFails === 0) { peg$fail(peg$e77); }
                                                }
                                              }
                                            }
                                            if (s2 !== peg$FAILED) {
                                              peg$savedPos = s0;
                                              s0 = peg$f36();
                                            } else {
                                              peg$currPos = s0;
                                              s0 = peg$FAILED;
                                            }
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$currPos;
                                              s1 = peg$parse_();
                                              s2 = input.substr(peg$currPos, 2);
                                              if (s2.toLowerCase() === peg$c77) {
                                                peg$currPos += 2;
                                              } else {
                                                s2 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$e78); }
                                              }
                                              if (s2 === peg$FAILED) {
                                                s2 = input.substr(peg$currPos, 3);
                                                if (s2.toLowerCase() === peg$c78) {
                                                  peg$currPos += 3;
                                                } else {
                                                  s2 = peg$FAILED;
                                                  if (peg$silentFails === 0) { peg$fail(peg$e79); }
                                                }
                                                if (s2 === peg$FAILED) {
                                                  s2 = input.substr(peg$currPos, 3);
                                                  if (s2.toLowerCase() === peg$c79) {
                                                    peg$currPos += 3;
                                                  } else {
                                                    s2 = peg$FAILED;
                                                    if (peg$silentFails === 0) { peg$fail(peg$e80); }
                                                  }
                                                }
                                              }
                                              if (s2 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s0 = peg$f37();
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                              }
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                s1 = peg$parse_();
                                                s2 = input.substr(peg$currPos, 2);
                                                if (s2.toLowerCase() === peg$c80) {
                                                  peg$currPos += 2;
                                                } else {
                                                  s2 = peg$FAILED;
                                                  if (peg$silentFails === 0) { peg$fail(peg$e81); }
                                                }
                                                if (s2 === peg$FAILED) {
                                                  s2 = input.substr(peg$currPos, 3);
                                                  if (s2.toLowerCase() === peg$c81) {
                                                    peg$currPos += 3;
                                                  } else {
                                                    s2 = peg$FAILED;
                                                    if (peg$silentFails === 0) { peg$fail(peg$e82); }
                                                  }
                                                  if (s2 === peg$FAILED) {
                                                    s2 = input.substr(peg$currPos, 3);
                                                    if (s2.toLowerCase() === peg$c82) {
                                                      peg$currPos += 3;
                                                    } else {
                                                      s2 = peg$FAILED;
                                                      if (peg$silentFails === 0) { peg$fail(peg$e83); }
                                                    }
                                                  }
                                                }
                                                if (s2 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s0 = peg$f38();
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$FAILED;
                                                }
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$currPos;
                                                  s1 = peg$parse_();
                                                  s2 = input.substr(peg$currPos, 2);
                                                  if (s2.toLowerCase() === peg$c83) {
                                                    peg$currPos += 2;
                                                  } else {
                                                    s2 = peg$FAILED;
                                                    if (peg$silentFails === 0) { peg$fail(peg$e84); }
                                                  }
                                                  if (s2 === peg$FAILED) {
                                                    s2 = input.substr(peg$currPos, 3);
                                                    if (s2.toLowerCase() === peg$c84) {
                                                      peg$currPos += 3;
                                                    } else {
                                                      s2 = peg$FAILED;
                                                      if (peg$silentFails === 0) { peg$fail(peg$e85); }
                                                    }
                                                    if (s2 === peg$FAILED) {
                                                      s2 = input.substr(peg$currPos, 3);
                                                      if (s2.toLowerCase() === peg$c85) {
                                                        peg$currPos += 3;
                                                      } else {
                                                        s2 = peg$FAILED;
                                                        if (peg$silentFails === 0) { peg$fail(peg$e86); }
                                                      }
                                                    }
                                                  }
                                                  if (s2 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s0 = peg$f39();
                                                  } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                  }
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$currPos;
                                                    s1 = peg$parse_();
                                                    s2 = input.substr(peg$currPos, 3);
                                                    if (s2.toLowerCase() === peg$c86) {
                                                      peg$currPos += 3;
                                                    } else {
                                                      s2 = peg$FAILED;
                                                      if (peg$silentFails === 0) { peg$fail(peg$e87); }
                                                    }
                                                    if (s2 === peg$FAILED) {
                                                      s2 = input.substr(peg$currPos, 3);
                                                      if (s2.toLowerCase() === peg$c87) {
                                                        peg$currPos += 3;
                                                      } else {
                                                        s2 = peg$FAILED;
                                                        if (peg$silentFails === 0) { peg$fail(peg$e88); }
                                                      }
                                                      if (s2 === peg$FAILED) {
                                                        s2 = input.substr(peg$currPos, 3);
                                                        if (s2.toLowerCase() === peg$c88) {
                                                          peg$currPos += 3;
                                                        } else {
                                                          s2 = peg$FAILED;
                                                          if (peg$silentFails === 0) { peg$fail(peg$e89); }
                                                        }
                                                      }
                                                    }
                                                    if (s2 !== peg$FAILED) {
                                                      peg$savedPos = s0;
                                                      s0 = peg$f40();
                                                    } else {
                                                      peg$currPos = s0;
                                                      s0 = peg$FAILED;
                                                    }
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$currPos;
                                                      s1 = peg$parse_();
                                                      s2 = input.substr(peg$currPos, 3);
                                                      if (s2.toLowerCase() === peg$c89) {
                                                        peg$currPos += 3;
                                                      } else {
                                                        s2 = peg$FAILED;
                                                        if (peg$silentFails === 0) { peg$fail(peg$e90); }
                                                      }
                                                      if (s2 === peg$FAILED) {
                                                        s2 = input.substr(peg$currPos, 3);
                                                        if (s2.toLowerCase() === peg$c90) {
                                                          peg$currPos += 3;
                                                        } else {
                                                          s2 = peg$FAILED;
                                                          if (peg$silentFails === 0) { peg$fail(peg$e91); }
                                                        }
                                                        if (s2 === peg$FAILED) {
                                                          s2 = input.substr(peg$currPos, 3);
                                                          if (s2.toLowerCase() === peg$c91) {
                                                            peg$currPos += 3;
                                                          } else {
                                                            s2 = peg$FAILED;
                                                            if (peg$silentFails === 0) { peg$fail(peg$e92); }
                                                          }
                                                        }
                                                      }
                                                      if (s2 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s0 = peg$f41();
                                                      } else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                      }
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$currPos;
                                                        s1 = peg$parse_();
                                                        s2 = input.substr(peg$currPos, 2);
                                                        if (s2.toLowerCase() === peg$c92) {
                                                          peg$currPos += 2;
                                                        } else {
                                                          s2 = peg$FAILED;
                                                          if (peg$silentFails === 0) { peg$fail(peg$e93); }
                                                        }
                                                        if (s2 === peg$FAILED) {
                                                          s2 = input.substr(peg$currPos, 3);
                                                          if (s2.toLowerCase() === peg$c93) {
                                                            peg$currPos += 3;
                                                          } else {
                                                            s2 = peg$FAILED;
                                                            if (peg$silentFails === 0) { peg$fail(peg$e94); }
                                                          }
                                                          if (s2 === peg$FAILED) {
                                                            s2 = input.substr(peg$currPos, 3);
                                                            if (s2.toLowerCase() === peg$c94) {
                                                              peg$currPos += 3;
                                                            } else {
                                                              s2 = peg$FAILED;
                                                              if (peg$silentFails === 0) { peg$fail(peg$e95); }
                                                            }
                                                          }
                                                        }
                                                        if (s2 !== peg$FAILED) {
                                                          peg$savedPos = s0;
                                                          s0 = peg$f42();
                                                        } else {
                                                          peg$currPos = s0;
                                                          s0 = peg$FAILED;
                                                        }
                                                        if (s0 === peg$FAILED) {
                                                          s0 = peg$currPos;
                                                          s1 = peg$parse_();
                                                          s2 = input.substr(peg$currPos, 2);
                                                          if (s2.toLowerCase() === peg$c95) {
                                                            peg$currPos += 2;
                                                          } else {
                                                            s2 = peg$FAILED;
                                                            if (peg$silentFails === 0) { peg$fail(peg$e96); }
                                                          }
                                                          if (s2 === peg$FAILED) {
                                                            s2 = input.substr(peg$currPos, 3);
                                                            if (s2.toLowerCase() === peg$c96) {
                                                              peg$currPos += 3;
                                                            } else {
                                                              s2 = peg$FAILED;
                                                              if (peg$silentFails === 0) { peg$fail(peg$e97); }
                                                            }
                                                            if (s2 === peg$FAILED) {
                                                              s2 = input.substr(peg$currPos, 3);
                                                              if (s2.toLowerCase() === peg$c97) {
                                                                peg$currPos += 3;
                                                              } else {
                                                                s2 = peg$FAILED;
                                                                if (peg$silentFails === 0) { peg$fail(peg$e98); }
                                                              }
                                                            }
                                                          }
                                                          if (s2 !== peg$FAILED) {
                                                            peg$savedPos = s0;
                                                            s0 = peg$f43();
                                                          } else {
                                                            peg$currPos = s0;
                                                            s0 = peg$FAILED;
                                                          }
                                                          if (s0 === peg$FAILED) {
                                                            s0 = peg$currPos;
                                                            s1 = peg$parse_();
                                                            s2 = input.substr(peg$currPos, 2);
                                                            if (s2.toLowerCase() === peg$c98) {
                                                              peg$currPos += 2;
                                                            } else {
                                                              s2 = peg$FAILED;
                                                              if (peg$silentFails === 0) { peg$fail(peg$e99); }
                                                            }
                                                            if (s2 === peg$FAILED) {
                                                              s2 = input.substr(peg$currPos, 3);
                                                              if (s2.toLowerCase() === peg$c99) {
                                                                peg$currPos += 3;
                                                              } else {
                                                                s2 = peg$FAILED;
                                                                if (peg$silentFails === 0) { peg$fail(peg$e100); }
                                                              }
                                                              if (s2 === peg$FAILED) {
                                                                s2 = input.substr(peg$currPos, 3);
                                                                if (s2.toLowerCase() === peg$c100) {
                                                                  peg$currPos += 3;
                                                                } else {
                                                                  s2 = peg$FAILED;
                                                                  if (peg$silentFails === 0) { peg$fail(peg$e101); }
                                                                }
                                                              }
                                                            }
                                                            if (s2 !== peg$FAILED) {
                                                              peg$savedPos = s0;
                                                              s0 = peg$f44();
                                                            } else {
                                                              peg$currPos = s0;
                                                              s0 = peg$FAILED;
                                                            }
                                                            if (s0 === peg$FAILED) {
                                                              s0 = peg$currPos;
                                                              s1 = peg$parse_();
                                                              s2 = input.substr(peg$currPos, 2);
                                                              if (s2.toLowerCase() === peg$c101) {
                                                                peg$currPos += 2;
                                                              } else {
                                                                s2 = peg$FAILED;
                                                                if (peg$silentFails === 0) { peg$fail(peg$e102); }
                                                              }
                                                              if (s2 === peg$FAILED) {
                                                                s2 = input.substr(peg$currPos, 3);
                                                                if (s2.toLowerCase() === peg$c102) {
                                                                  peg$currPos += 3;
                                                                } else {
                                                                  s2 = peg$FAILED;
                                                                  if (peg$silentFails === 0) { peg$fail(peg$e103); }
                                                                }
                                                                if (s2 === peg$FAILED) {
                                                                  s2 = input.substr(peg$currPos, 3);
                                                                  if (s2.toLowerCase() === peg$c103) {
                                                                    peg$currPos += 3;
                                                                  } else {
                                                                    s2 = peg$FAILED;
                                                                    if (peg$silentFails === 0) { peg$fail(peg$e104); }
                                                                  }
                                                                }
                                                              }
                                                              if (s2 !== peg$FAILED) {
                                                                peg$savedPos = s0;
                                                                s0 = peg$f45();
                                                              } else {
                                                                peg$currPos = s0;
                                                                s0 = peg$FAILED;
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e14); }
    }

    return s0;
  }

  function peg$parselabel() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parse__();
    s2 = peg$parsename();
    if (s2 !== peg$FAILED) {
      s3 = peg$parse__();
      if (input.charCodeAt(peg$currPos) === 58) {
        s4 = peg$c104;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e106); }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parse__();
        peg$savedPos = s0;
        s0 = peg$f46(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e105); }
    }

    return s0;
  }

  function peg$parsename() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (peg$r0.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e108); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = input.charAt(peg$currPos);
      if (peg$r1.test(s3)) {
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e109); }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = input.charAt(peg$currPos);
        if (peg$r1.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e109); }
        }
      }
      peg$savedPos = s0;
      s0 = peg$f47();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e107); }
    }

    return s0;
  }

  function peg$parseimm() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parse_();
    s2 = [];
    s3 = input.charAt(peg$currPos);
    if (peg$r2.test(s3)) {
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e111); }
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = input.charAt(peg$currPos);
        if (peg$r2.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e111); }
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f48(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e110); }
    }

    return s0;
  }

  function peg$parsecomma() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parse_();
    if (input.charCodeAt(peg$currPos) === 44) {
      s2 = peg$c105;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e113); }
    }
    if (s2 !== peg$FAILED) {
      s1 = [s1, s2];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e112); }
    }

    return s0;
  }

  function peg$parseend() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parse_();
    if (input.charCodeAt(peg$currPos) === 10) {
      s2 = peg$c106;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e115); }
    }
    if (s2 !== peg$FAILED) {
      s1 = [s1, s2];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e114); }
    }

    return s0;
  }

  function peg$parse_() {
    var s0, s1;

    peg$silentFails++;
    s0 = [];
    s1 = input.charAt(peg$currPos);
    if (peg$r3.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e117); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = input.charAt(peg$currPos);
      if (peg$r3.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e117); }
      }
    }
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) { peg$fail(peg$e116); }

    return s0;
  }

  function peg$parse__() {
    var s0, s1;

    peg$silentFails++;
    s0 = [];
    s1 = input.charAt(peg$currPos);
    if (peg$r4.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e119); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = input.charAt(peg$currPos);
      if (peg$r4.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e119); }
      }
    }
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) { peg$fail(peg$e118); }

    return s0;
  }

	let i = []; 
  peg$result = peg$startRuleFunction();

  if (options.peg$library) {
    return /** @type {any} */ ({
      peg$result,
      peg$currPos,
      peg$FAILED,
      peg$maxFailExpected,
      peg$maxFailPos
    });
  }
  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}


const PEG = (function(){
  return {
    StartRules: ["program"],
    SyntaxError: peg$SyntaxError,
    parse: peg$parse
  };
})();

export default PEG;

