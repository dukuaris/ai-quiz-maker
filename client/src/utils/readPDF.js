import * as pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc =
	'../../node_modules/pdfjs-dist/build/pdf.worker.js'

const getContent = async (file, callbackAllDone) => {
	let complete = 0
	const loadingTask = pdfjsLib.getDocument(file)
	loadingTask.promise.then((pdf) => {
		let total = pdf._pdfInfo.numPages
		let layers = {}
		for (let i = 1; i <= total; i++) {
			pdf.getPage(i).then((page) => {
				let n = page.pageNumber
				page.getTextContent().then((textContent) => {
					if (null != textContent.items) {
						let page_text = ''
						let last_block = null
						for (let k = 0; k < textContent.items.length; k++) {
							let block = textContent.items[k]
							if (
								last_block != null &&
								last_block.str[last_block.str.length - 1] != ' '
							) {
								if (block.x < last_block.x) page_text += '\r\n'
								else if (
									last_block.y != block.y &&
									last_block.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) ==
										null
								)
									page_text += ' '
							}
							page_text += block.str
							last_block = block
						}

						textContent != null && console.log('page ' + n + ' finished.') //" content: \n" + page_text);
						layers[n] = page_text + '\n\n'
					}
					++complete
					if (complete == total) {
						window.setTimeout(function () {
							var full_text = ''
							var num_pages = Object.keys(layers).length
							for (var j = 1; j <= num_pages; j++) full_text += layers[j]
							callbackAllDone(full_text)
						}, 1000)
					}
				})
			})
		}
	})
}

export default getContent
