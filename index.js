let parse = require("./src/parser.js")

function test(source) {
	console.log("source: " + source)
	console.log(parse(source))
}

test("123")
test(".123")
test("000.123")
test(".")
test("123.")
test("-.023")
test("0.4.3")
