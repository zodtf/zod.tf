// My simple lil markdown website thing
// by zudsniper

const port = 6969;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const showdown = require('showdown');
const matter = require('gray-matter');
const fs = require('fs');
const favicon = require('serve-favicon');

let app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(favicon(__dirname + '/public/imgs/favicon.ico'));

app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "ejs");

// Read in package.json for some stats
const pkgJSON = fs.readFileSync('package.json').toJSON();

const converter = new showdown.Converter();

function getPosts(extension='.md') {
	return fs.readdirSync(__dirname + "/posts").filter(f => {return f!=null && f!=='undefined'}).filter(f => f.endsWith(extension));
}

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
		htmlPrecompiled = fs.readFileSync(htmlFile, "utf8");
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



app.get('/random', (req, res) => {
	const postNames = getPosts().map((fname) => {
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



app.listen(port, () => {
	console.log(`mkdn server up on port ${port}`);
});
