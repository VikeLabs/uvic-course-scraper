const cheerio = require('cheerio');
var request = require('request-promise');

/**
 * Gets the semeter codes UVic uses to organize courses
 *
 * @returns {Object} an object containing semester values and calling values
 */
const getSemesterCodes = async () => {
	try {
		let response = await request('https://www.uvic.ca/BAN1P/bwckschd.p_disp_dyn_sched');
		const $ = cheerio.load(response);

		let data = {};

		// Gets the p_calling key value pair
		const input = $('input').get(0);
		data.callingKey = $(input).attr('name');
		data.callingValue = $(input).attr('value');

		// Gets the p_term key
		const select = $('select').get(0);
		data.termKey = $(select).attr('name');

		// Gets all active semester codes
		const codes = [];
		const semesters = $('option');
		semesters.each((i, element) => {
			const value = $(element).attr('value');
			if (
				!$(element)
					.text()
					.includes('View only') &&
				value
			) {
				codes.push(value);
			}
		});
		data.termCodes = codes;
		return data;
	} catch (error) {
		console.log(error);
		throw new Error('Failed to get semeter data');
	}
};

const getCourseCodes = async data => {
	let form = {};
	form[data.callingKey] = data.callingValue;
	form[data.termKey] = data.termCodes[0];

	try {
		const response = await request.post({
			url: 'https://www.uvic.ca/BAN1P/bwckgens.p_proc_term_date',
			formData: form
		});
		console.log(response);
	} catch (error) {
		console.log(error);
		throw new Error('Failed to get course data');
	}
};

getSemesterCodes().then(response => getCourseCodes(response));
