import pdfjsLib from 'pdfjs-dist'

const getPdfContent = async (data) => {
	const doc = await pdfjsLib.getDocument({ data: data })
	const page = await doc.getPage(1)
	const content = await page.getTextContent()
	content.items.map((item) => {
		console.log(item.str)
		console.log(item.fontName)
		console.log(item.transform)
	})
}

export default getPdfContent
