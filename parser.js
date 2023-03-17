
// Parser code

// Require the necessary modules
const request = require('request');
const fs = require('fs');

// Set the delay between requests to 400ms
const requestDelay = 90;

// Set the initial id and id limit
let currentId = 330;
const idLimit = 2408;

// Create the folders to store the html and css
const dir = './data/';
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}
if (!fs.existsSync(dir + 'html/')) {
	fs.mkdirSync(dir + 'html/');
}
if (!fs.existsSync(dir + 'css/')) {
	fs.mkdirSync(dir + 'css/');
}

// Function to make the request
function makeRequest(id) {
	setTimeout(() => {
		const url = `https://flareboard.ru/thread.php?id=${id}`;
		request(url, (err, resp, body) => {
			if (!err && resp.statusCode == 200) {
				// Save HTML to file
				fs.writeFile(`${dir}html/${id}.html`, body, err => {
					if (err) {
						console.log(err);
					}
				});

				// Extract the css links
				const regex = /<link.*?href="(.*?)"/g;
				let cssLinks = body.match(regex);

				// Download the css
				if (cssLinks) {
					cssLinks.forEach(link => {
						const cssUrl = link.split('"')[1];
						request(cssUrl, (err, resp, body) => {
							if (!err && resp.statusCode == 200) {
								// Write the css to file
								fs.writeFile(
									`${dir}css/${cssUrl.split('/').pop()}`,
									body,
									err => {
										if (err) {
											console.log(err);
										}
									}
								);
							}
						});
					});
				}

				// Make the next request
				if (currentId < idLimit) {
					currentId++;
					makeRequest(currentId);
				}
			}
		});
	}, requestDelay);
}

// Start the parsing process
makeRequest(currentId);