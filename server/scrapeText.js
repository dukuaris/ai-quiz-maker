const puppeteer = require('puppeteer')
require('dotenv').config()

const scrapeText = async (req, res) => {
	const url = req.body.url
	const browser = await puppeteer.launch({
		args: [
			'--disable-setuid-sandbox',
			'--no-sandbox',
			'--single-process',
			'--no-zygote',
		],
		executablePath:
			process.env.NODE_ENV === 'production'
				? process.env.PUPPETEER_EXECUTABLE_PATH
				: puppeteer.executablePath(),
	})
	try {
		const page = await browser.newPage()
		await page.setDefaultNavigationTimeout(0)
		await page.goto(url)

		const title = await page.evaluate(() => document.title)
		const text = await page.evaluate(() => document.body.innerText)

		res.status(200).send({
			title: title,
			results: text,
		})
	} catch (error) {
		console.error(error)
		res.status(500).send(error || 'Crawling failed!')
	} finally {
		await browser.close()
	}
}

module.exports = { scrapeText }
