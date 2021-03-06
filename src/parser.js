/**
 * @overview Алгоритм парсинга текста
 * @author MrGobus <mrgobus@gmail.com>
 */

/**
 * Разбивает строку на составные части формируя данные для последующей компиляции
 *
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
	let startPosition = 0 // Сюда запоминаем начало подстроки

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
							value: word,
							position: startPosition
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
						type = undefined

						// Если число заканчиваетс на точку,
						// то интерпритируем ее как отдельный символ

						if (word[word.length - 1] == ".") {

							result.push({
								type: "number",
								value: parseFloat(word.slice(0, -1)),
								position: startPosition
							})

							result.push({
								type: "sign",
								value: ".",
								position: startPosition + word.length - 1
							})

							word = ""
							continue

						}

						// Конец подстроки числа

						result.push({
							type: "number",
							value: parseFloat(word),
							position: startPosition
						})

						word = ""

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
							value: word,
							position: startPosition
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

						type = undefined

						// Если смвол оканчивается на "+" или "-", и далее следует
						// числовое значение, то считаем "+" или "-" частью числа

						if (isSign(word[word.length - 1]) && isDigit(character)) {

							result.push({
								type: "sign",
								value: word.slice(0, -1),
								position: startPosition
							})

							word = ""
							position -= 1
							continue

						}

						// Конец подстроки

						result.push({
							type: "sign",
							value: word,
							position: startPosition
						})

						word = ""

					}

					break

			}

		} else {

			// Ищем начало подстроки

			if (isSymbol(character)) {
				startPosition = position
				word = character
				type = 'name'
			} else

			// Цифры могу начинаться со знака "+" или "-"
			// Если после знака в начале строки следует цифра то это число
			// Также это число если за знаком следует точка за которой следует числовой символ

			if (isSign(character) && (isDigit(source[position + 1]) || (source[position + 1] == "." && isDigit(source[position + 2])))) {
				startPosition = position
				word = character
				type = 'number'
			} else

			// Число
			// Может начинаться на '.', что означает что далее следует дробная часть

			if (isDigit(character) || (character == "." && isDigit(source[position + 1]))) {
				if (character == ".") {
					hasDot = true
				}
				startPosition = position
				word = character
				type = 'number'
			} else

			// Одиночный символ

			if (isSingle(character)) {
				result.push({
					type: "sign",
					value: character,
					position: position
				})
			} else

			// Мульти символы

			if (isMulti(character)) {
				startPosition = position
				word = character
				type = 'multi'
			} else

			// Строка в кавычках

			if (isQuote(character)) {
				startPosition = position
				type = "text"
				quote = character
			}

			position++

		}

	}

	return result

}
