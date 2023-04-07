import * as pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc =
	'../../node_modules/pdfjs-dist/build/pdf.worker.js'
// import 'https://npmcdn.com/pdfjs-dist/build/pdf.js'
// pdfjsLib.GlobalWorkerOptions.workerSrc =
// 	'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.5.141/build/pdf.worker.min.js'

class Pdf2TextClass {
	constructor() {
		this.complete = 0
	}

	pdfToText(data, callbackPageDone, callbackAllDone) {
		console.assert(data instanceof ArrayBuffer || typeof data == 'string')
		let loadingTask = pdfjsLib.getDocument(data)
		loadingTask.promise.then((pdf) => {
			let total = pdf._pdfInfo.numPages
			let layers = {}
			for (let i = 1; i <= total; i++) {
				pdf.getPage(i).then((page) => {
					let n = page.pageNumber
					page.getTextContent().then((textContent) => {
						if (textContent.items !== null) {
							let page_text = ''
							let last_block = null
							for (let k = 0; k < textContent.items.length; k++) {
								let block = textContent.items[k]
								if (
									last_block !== null &&
									last_block.str[last_block.str.length - 1] !== ' '
								) {
									if (block.x < last_block.x) page_text += '\r\n'
									else if (
										last_block.y !== block.y &&
										last_block.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) ===
											null
									)
										page_text += ' '
								}
								page_text += block.str
								last_block = block
							}
							textContent !== null && console.log('page ' + n + ' finished.')
							layers[n] = page_text + '\n\n'
						}
						++this.complete
						if (this.complete === total) {
							window.setTimeout(() => {
								let full_text = ''
								let num_pages = Object.keys(layers).length
								for (let j = 1; j <= num_pages; j++) full_text += layers[j]
								callbackAllDone(full_text)
							}, 1000)
						}
					})
				})
			}
		})
	}
}

export default Pdf2TextClass
