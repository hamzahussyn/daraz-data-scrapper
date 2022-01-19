const puppeteer = require('puppeteer');
const fs = require('fs');

let scrape = async () => {
	const browser = await puppeteer.launch( { headless: false })
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(0);
	await page.setViewport({
		width: 1280,
		height: 1080,
	});
	
	let level = 0

	//Change the url here
	await page.goto('https://www.daraz.pk/tablets/', {waitUntil: 'load', timeout: 0});
	

	await page.screenshot({ path: `./screenshots/screenshot - ${level++}.png`, fullPage: true });

	var results = []; 

	await page.addScriptTag({ path: 'jquery.js' });

	var lastPageNumber = await page.evaluate(() => {
		const $ = window.$; 
		return  Number($('ul.ant-pagination li:nth-last-child(2) > a').html());
	});

	await page.screenshot({ path: `screenshot - ${level++}.png`, fullPage: true });
	
	for (let index = 0; index < lastPageNumber; index++) {
		
		results = results.concat(await extractedEvaluateCall(page));
		
		if (index != lastPageNumber - 1) {
			
			const [response] = await Promise.all([
				page.click('li.ant-pagination-next > a', ),
				page.waitForNavigation({
					waitUntil: 'domcontentloaded',
				}),
				page.waitForSelector('div.c1_t2i')
			]);

			


			await page.screenshot({ path: `./screenshots/screenshot - ${level++}.png`, fullPage: true });

		}
	}

	browser.close();
	return results;
};

async function extractedEvaluateCall(page) {
	await page.addScriptTag({ path: 'jquery.js' });	
	return page.evaluate(() => {
		let data = [];

		$('div.c1_t2i').map(function(i){
			$('div.c2prKC').map(function(i){
				data.push( {
					image: $(this).find('div.cRjKsc > a > img').attr('src'),
					title: $(this).find('div.c16H9d > a').text(),
					price: $(this).find('span.c13VH6').text(),
					originalPrice: $(this).find('span.c1-B2V > del').text(),
					priceOff: $(this).find('span.c1hkC1').text(),
					manufacturer: $(this).find('span.c1enUu').text(),
				})
			})			
		})		


		return data;
	});
}

scrape().then((results) => {
	console.log(JSON.stringify(results, null, '\t'));

	let serializedResults = JSON.stringify(results, null, 4);

	try {
		//Change the name of file to save data to here
		let fileName = 'daraz-tablets.json';

		fs.writeFileSync('./scrapped-data/' + fileName, serializedResults);
		console.log(`All the above data was saved to the file: ${fileName}`);
	} catch (error) {}
});
