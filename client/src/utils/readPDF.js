import 'https://npmcdn.com/pdfjs-dist/build/pdf.js'

pdfjsLib.GlobalWorkerOptions.workerSrc =
	'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.5.141/build/pdf.worker.min.js'

function convertPdf(file) {
	let fr = new FileReader()
	let pdff = new Pdf2TextClass()
	fr.onload = function () {
		pdff.pdfToText(fr.result, null, (text) => {
			console.log(text)
		})
	}
	fr.readAsDataURL(file)
}

function Pdf2TextClass() {
	let self = this
	this.complete = 0

	this.pdfToText = function (data, callbackPageDone, callbackAllDone) {
		console.assert(data instanceof ArrayBuffer || typeof data == 'string')
		let loadingTask = pdfjsLib.getDocument(data)
		loadingTask.promise.then(function (pdf) {
			let total = pdf._pdfInfo.numPages
			//callbackPageDone( 0, total );
			let layers = {}
			for (let i = 1; i <= total; i++) {
				pdf.getPage(i).then(function (page) {
					let n = page.pageNumber
					page.getTextContent().then(function (textContent) {
						//console.log(textContent.items[0]);0
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
						++self.complete
						//callbackPageDone( self.complete, total );
						if (self.complete == total) {
							window.setTimeout(function () {
								let full_text = ''
								let num_pages = Object.keys(layers).length
								for (let j = 1; j <= num_pages; j++) full_text += layers[j]
								callbackAllDone(full_text)
							}, 1000)
						}
					}) // end  of page.getTextContent().then
				}) // end of page.then
			} // of for
		})
	} // end of pdfToText()
}

export default convertPdf
