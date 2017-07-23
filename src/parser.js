/**
 * @overview Парсинг текста
 * @author MrGobus <mrgobus@gmail.com>
 */

/**
 * Парсинг
 * @param {string} source - исходный текст
 * @return {object[]} массив объектов хранящих значения парсинга в виде {type, value}
 */

module.exports = function parse(source) {

	const isSymbol = (character) => "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(character) != -1
	const isDigit = (character) => "0123456789".indexOf(character) != -1
	const isSign = (character) => "+-".indexOf(character) != -1
	const isQuote = (character) => "'\"".indexOf(character) != -1
	const isSpace = (character) => " \t".indexOf(character) != -1
	const isSingle = (character) => "()[]{}:;,.#".indexOf(character) != -1
	const isMulti = (character) => "+-*/=!><%^&|".indexOf(character) != -1

	let result = [] // Коллекция результатов
	let position = 0 // Позиция в исходной строке
	let type = "none" // Тип подстроки
	let word = "" // Аккумулятор подстроки
	let quote = undefined // Сюда сохраняем открывающую кавычку
	let hasDot = false // Говорит о том что в подстроке числа уже есть точка

	while (position <= source.length) {

		let character = source[position]

		if (word || quote) {

			switch (type) {

				case "name":

					// Переменная начинается с символа,
					// далее может содержать как буквы так и цифры

					if (isSymbol(character) || isDigit(character)) {

						word += character
						position++
						continue

				 	} else {

						// Конец подстроки

						result.push({
							type: type,
							value: word
						})

						word = ""
						type = undefined

					}

					break

				case "number":

					if (isDigit(character) || (character == "." && !hasDot)) {

						if (character == ".") {
							hasDot = true;
						}

						word += character
						position++
						continue

					} else {

						hasDot = false

						// Если число заканчиваетс на точку,
						// то интерпритируем ее как отдельный символ

						if (word[word.length - 1] == ".") {

							result.push({
								type: "number",
								value: parseFloat(word.slice(0, -1))
							})

							result.push({
								type: "sign",
								value: "."
							})

							word = ""
							type = undefined

							continue

						}

						// Конец подстроки числа

						result.push({
							type: "number",
							value: parseFloat(word)
						})

						word = ""
						type = undefined

						if (isSymbol(character)) {
							continue
						}

						// Если мы встретили второую точку, то начинаем чтение
						// следующей подстроки с этого места

						if (character == ".") {
							continue
						}

					}

					break

				case "text":

					if (character != quote && character != undefined) {

						// Если встречаем обратный слеш "\"", то вместо него
						// подставляем следующий символ. Благодаря этому
						// становится возможно использовать знак кавычки в тексте
						// "\"". Для того чтобы использовать в тексте обратный слеш
						// пишем его два раза "\\"

						if (character == "\\") {
							word += source[position + 1]
							position += 2
						} else {
							word += character
							position++
						}

						continue

					} else {

/*
						Ошибка, когда буквы кончились а кавычки не закрылись

						Пока отключена, считается что строка просто закончилась

						if (character == undefined) {
							throw("error: unexpected end of string")
						}
 */

						// Конец подстроки текста

						result.push({
							type: type,
							value: word
						})

						word = ""
						type = undefined
						quote = undefined

						position++
						continue

					}

				case "multi":

					if (isMulti(character)) {

						word += character
						position++
						continue

					} else {

						// Если смвол оканчивается на "+" или "-", и далее следует
						// числовое значение, то считаем "+" или "-" частью числа

						if (isSign(word[word.length - 1]) && isDigit(character)) {

							result.push({
								type: "sign",
								value: word.slice(0, -1)
							})

							word = ""
							type = undefined

							position -= 1
							continue

						}

						// Конец подстроки

						result.push({
							type: "sign",
							value: word
						})

						word = ""
						type = undefined

					}

					break

			}

		}

		// Ищем начало подстроки

		if (isSymbol(character)) {
			word = character
			type = 'name'
		} else

		// Цифры могу начинаться со знака "+" или "-"
		// Если после знака в начале строки следует цифра то это число
		// Также это число если за знаком следует точка за которой следует числовой символ

		if (isSign(character) && (isDigit(source[position + 1]) || (source[position + 1] == "." && isDigit(source[position + 2])))) {
			word = character
			type = 'number'
		} else

		// Число
		// Может начинаться на '.', что означает что далее следует дробная часть

		if (isDigit(character) || (character == "." && isDigit(source[position + 1]))) {
			if (character == ".") {
				hasDot = true
			}
			word = character
			type = 'number'
		} else

		// Одиночный символ

		if (isSingle(character)) {
			result.push({
				type: "sign",
				value: character
			})
		} else

		// Мульти символы

		if (isMulti(character)) {
			word = character
			type = 'multi'
		} else

		// Строка в кавычках

		if (isQuote(character)) {
			type = "text"
			quote = character
		}

		position++

	}

	return result

}
