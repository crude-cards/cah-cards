const request = require('superagent');
const fs = require('fs');

const decks = [
	'Base',
	'CAHe1',
	'CAHe2',
	'CAHe3',
	'CAHe4',
	'CAHe5',
	'CAHe6',
	'greenbox',
	'90s',
	'Box',
	'fantasy',
	'food',
	'science',
	'www',
	'hillary',
	'trumpvote',
	'trumpbag',
	'xmas2012',
	'xmas2013',
	'PAXE2013',
	'PAXP2013',
	'PAXE2014',
	'PAXEP2014',
	'PAXPP2014',
	'PAX2015',
	'HOCAH',
	'reject',
	'reject2',
	'Canadian',
	'misprint'
];

console.log(`${Object.keys(decks).length} decks...`);

const form = decks.map(v => `decks[]=${v}`).join('&') + '&type=JSON';
const successful = [];

request
	.post('https://www.crhallberg.com/cah/json/output.php')
	.type('form')
	.send(form)
	.then(res => {
		if (!res.body) throw Error('no body');
		for (const deck of decks) {
			const parsed = { cards: [] };
			const obj = res.body[deck];
			parsed.name = obj.name;
			parsed.cards = parsed.cards.concat(
				obj.black.map(v => ({
					type: 0,
					text: res.body.blackCards[v].text
				}))
			);
			parsed.cards = parsed.cards.concat(
				obj.white.map(v => ({
					type: 1,
					text: res.body.whiteCards[v]
				}))
			);
			fs.writeFile(`./src/cards/${deck}.json`, JSON.stringify(parsed), e => {
				decks.pop();
				if (e) console.error(e);
				else successful.push(deck);
				if (decks.length === 0) genIndex();
			});
		}
	})
	.catch(console.error);

	function genIndex() {
		const exp = successful.map(d => `'${d}': require('./cards/${d}')`);
		const template = `module.exports = {${exp.join(',')}}`;
		fs.writeFile('./src/map.js', template, console.log);
	}