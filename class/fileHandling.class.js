const fs = require('fs');
const Hashids = require('hashids');
const hash = require(__class_dir + '/hash.class.js');
class filehandling {
	constructor(directory) {
		this.saveDir = directory;
	}

	checkFileType(mimetype){
		const allowedMimetype = [
			'image/png',
			'image/jpeg',
			'image/bmp',
			'image/gif',
			'application/pdf',
			'application/rtf',
			'text/html',
			'text/csv',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		];

		for(let key in allowedMimetype){
			if(mimetype === allowedMimetype[key]){
				return {status:true};
			}
		}

		return {
			status:false,
			error: 'Allowed types: '+allowedMimetype.join(', ')
		};
	}

	getExtension(filename) {
		const i = filename.lastIndexOf('.');
		return (i < 0) ? '' : filename.substr(i+1);
	}

	uploadFile(data){
		let timestamp = Date.now();
		let date = new Date(timestamp);
		let filename = (String(timestamp)+'_'+hash.md5(data.name));
		let hashids = new Hashids(String(timestamp),13,'abcdefghijklmnopqrstuvwxyz1234567890');

		return new Promise((resolve,reject)=>{
			try{
				let fileinfo = {
					fileId : hashids.encode(timestamp),
					filename : filename,
					orginal_filename : data.name,
					path : this.saveDir+filename,
					extension: this.getExtension(data.name),
					mimetype : data.mimetype,
					md5 : data.md5,
					dateUploaded:date
				};

				let isAllowed = this.checkFileType(fileinfo.mimetype);

				if(!isAllowed.status){
					throw isAllowed.error;
				}

				data.mv(fileinfo.path, function(err) {
					if (err)
						throw err;

					resolve({
						status:true,
						results:fileinfo
					});
				});
			}
			catch(error){
				reject({
					status:false,
					error:error
				});
			}
		});
	}

	readFile(path,mimetype,encoding=null){
		return new Promise((resolve,reject)=>{
			try{
				fs.readFile(path,encoding, function(error, data) {
					if (error)
						reject({
								status:false,
								error:error
							});

					resolve({
						status:true,
						mimetype:mimetype,
						data:data
					})
				});
			}
			catch(error){
				reject({
						status:false,
						error:error
					});
			}
		});
	}

	removeFile(path){
		return new Promise((resolve,reject)=>{
			try{
				fs.unlink(path, function(err, data) {
					if (err)
						throw err; // Fail if the file can't be read.

					resolve({
						status:true,
						data:data
					})
				});
			}
			catch(error){
				reject({
						status:false,
						error:error
					});
			}
		});
	}

	readDir(path){
		return new Promise((resolve,reject)=>{
			try{
				fs.readdir(path, function(err, data) {
					if (err)
						throw err; // Fail if the file can't be read.

					resolve({
						status:true,
						data:data
					})
				});
			}
			catch(error){
				reject({
						status:false,
						error:error
					});
			}
		});
	}
}
module.exports = filehandling;
