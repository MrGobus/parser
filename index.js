let parse = require("./src/parser.js")

function test(source) {
	console.log("source: " + source)
	console.log(parse(source))
}

console.log("Числа")

test("123")
test(".123")
test("0.123")
test("00.123")
test("+0.123")
test("-0.123")
test(".")
test("123.")
test("123..")
test("-.023")
test("0.4.3")
test("- -123")
test("--123")
test("-.-123")
test("-11")
test("+=-11")
test("+=-11.xxx")
