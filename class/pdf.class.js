const fs = require('fs');
const html2pdf = require('html-pdf');

class pdf {
	constructor() {
	}

	getPDF(html,data,options ={format:'A4'}){
		options = (options || {format:'A4'});

		return new Promise(async (resolve,reject)=>{
			html2pdf.create(html, options).toBuffer(function(error, buffer) {
				//~ console.log(options);
				if (error){
					reject({
							status:false,
							error:error
						});
					}

				resolve({
					status:true,
					mimetype:'application/pdf',
					data:buffer
				});
			});
		})
	}
}
module.exports = pdf;
