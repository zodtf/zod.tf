/**
 * @description zod.tf main entry point file
 * @overview this project is a simple markdown server that serves markdown files as html with some minimal styling and metadata encoding.
 *
 * TODO:
 * 	 Move away from single file webserver to a more modular	approach
 * 	 Switch to typescript
 * 	 Add deployment github workflows (generic deployment, setup scripts for nginx, anything else needed server side to get this running)
 *
 */

// TODO: ensure that this port binding is correct for the reverse proxy with nginx on deployment server
const port = 6969;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const showdown = require('showdown');
const matter = require('gray-matter');
const fs = require('fs');
const favicon = require('serve-favicon');
const figlet = require('figlet');


let app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(favicon(__dirname + '/public/imgs/favicon.ico'));

app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "ejs");

// Read in package.json for version number
const pkgJSON = require('./package.json');

// showdown markdown to html converter
const converter = new showdown.Converter();

// searches the posts directory for markdown files and returns them as an array
function getPostMDFiles(extension='.md') {
	return fs.readdirSync(__dirname + "/posts").filter(f => {return f!=null && f!=='undefined'}).filter(f => f.endsWith(extension));
}

// CONSTANTS //
app.locals = {
	links: {
		github: "https://gh.zod.tf",
		linkedin: "https://gh.zod.tf",
		steam: "https://steamcommunity.com/id/zodtf",
		music: "https://phantomfanboy.com",
		trade: {
			offer: "https://zod.tf/donate_items", // probably shouldn't have this link be this way, meh
			bptf: "https://backpack.tf/profiles/76561198071374501",
			trust: "https://trust.contenthell.earth",
			steamrep: "https://steamrep.com/profiles/76561198071374501",
		},
		donate: {
			paypal: "https://zod.tf/donate",
			kofi: "https://ko-fi.com/zodtf",
			github_sponsor: "https://github.com/sponsors/zudsniper"
		},
		servers: {
			chillypunch: {
				name: "mge_chillypunch_final4_fix2",
				ip: "zod.mge.tf:27015",
				connect: "steam://connect/zod.mge.tf:27015/"
			},
			classic: {
				name: "mge_training_v8_beta4b",
				ip: "zod.mge.tf:27016",
				connect: "steam://connect/zod.mge.tf:27016/"
			},
			oihguv: {
				name: "mge_oihguv_sucks_b5",
				ip: "zod.mge.tf:27017",
				connect: "steam://connect/zod.mge.tf:27017/"
			},
			triumph: {
				name: "mge_triumph_beta6_rc2",
				ip: "zod.mge.tf:27018",
				connect: "steam://connect/zod.mge.tf:27018/"
			},
		}
	}
}

// ROUTES //

// serve for index page
app.get('/', (req, res) => {
	const file = matter.read(path.join(__dirname, "posts", "README.md"));
	const htmlFile = path.join(__dirname, "posts", 'README.html');

	let htmlPrecompiled = null;
	let metadata = {
		"title": "zod.tf",
		"description": "where some of my stuff might be",
		"image": "https://user-images.githubusercontent.com/16076573/195044600-3786ef10-53fe-4e7a-befd-e8d58739139b.jpg",
		"options": {
			"showMetadata": false,
			"outputHTMLFile": false
		}
	};

	let theHTML;
	if(fs.existsSync(htmlFile)) {
		htmlPrecompiled = fs.readFileSync(htmlFile, {encoding: "utf8"});
	} else {
		theHTML = converter.makeHtml(file.content);
		if(metadata.options.outputHTMLFile) {
			fs.writeFileSync('./posts/' + req.params.post + '.md.html', theHTML, {encoding: "utf8"});
		}
	}

	res.render("index", {
		post: htmlPrecompiled !== null ? htmlPrecompiled : theHTML,
		title: metadata.title,
		description: metadata.description,
		image: metadata.image,
		options: metadata.options
	});
	// const posts = getPosts();
	// res.render("all", {
	// 	posts: posts.map((md) => converter.makeHtml(md))
	// });
});


// send user to a random valid post
app.get('/random', (req, res) => {
	const postNames = getPostMDFiles().map((fname) => {
		return fname.substring(0, fname.indexOf("."))
	});
	let randPostIndex = (Math.random() * postNames.length);
	let randPost = postNames.at(randPostIndex);
	let metadataFile = path.join(__dirname, "/posts", randPost + ".md.json");
	let metadata;

	if (fs.existsSync(metadataFile)) {
		metadata = fs.readFileSync(metadataFile);
	} else {
		metadata = {
			title: req.params.post,
			description: 'none.',
			image: 'https://static.thenounproject.com/png/82078-200.png',
			options: {
				showMetadata: true,
				outputHTMLFile: false
			}
		}
	}

	res.status(301).redirect(randPost);
});

// serve the post specified by the url -- valid posts are the markdown files in the ./posts directory
app.get('/:post', (req, res) => {
	req.params.post = req.params.post.replaceAll(":", "");
	const mdFile = matter.read(path.join(__dirname, "/posts", req.params.post + '.md'));
	const htmlFile = path.join(__dirname, "/posts", req.params.post + '.html');

	let htmlPrecompiled = null;

	let metadataFile = path.join(__dirname, "/posts", req.params.post + ".md.json");
	let metadata;
	if(fs.existsSync(metadataFile)) {
		metadata = fs.readFileSync(metadataFile);
	} else {
		metadata = {
			title: req.params.post,
			description: 'none.',
			image: 'https://static.thenounproject.com/png/82078-200.png',
			options: {
				showMetadata: true,
				outputHTMLFile: false
			}
		}
	}

	let theHTML;
	if(fs.existsSync(htmlFile)) {
		htmlPrecompiled = fs.readFileSync(htmlFile, "utf8");
	} else {
		theHTML = converter.makeHtml(mdFile.content);
		if(metadata.options.outputHTMLFile) {
			fs.writeFileSync('./posts/' + req.params.post + '.md.html', theHTML, {encoding: "utf8"});
		}
	}

	res.render("index", {
		post: htmlPrecompiled !== null ? htmlPrecompiled : theHTML,
		title: metadata.title,
		description: metadata.description,
		image: metadata.image,
		options: metadata.options
	});
});


// Start the express server on the specified port
app.listen(port, () => {

	figlet('zod.tf',
		{
			font: 'Broadway',
			horizontalLayout: 'default',
			verticalLayout: 'default'
		},
		(err, data) => {
		if (err) {
			console.log('Something went wrong...');
			console.dir(err);
			return;
		}
		let border_len = data.split('\n')[0].length + (4 /* text border gutter size on either side */);
		console.log('='.repeat(border_len) + `${data}\n` + '='.repeat(border_len) + '\n');
		console.log(`simple mkdn parse-server started on ${port}...`);
	});
	console.log(`version: v${pkgJSON.version}`);
	console.log(`port: ${port}`);
});
