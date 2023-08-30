# MASK-Event  
> _The website for MASK's upcoming quiz._

This repository uses the MASK Website [repository](https://github.com/kgpmask/MASK) as a reference to make a lighter version of the site for the upcoming event(s). We did not fork the base repository because, well, it's really huge. (_You know you want to say it._)

---

## Dependencies  
Most of the dependencies used are pretty much the same as the ones used in the MASK repository:
- `axios`: An API used for sending HTTP requests and testing.
- `bcrypt`: A library to help has functions.
- `cookie-parser`: Creates a cookie parser middleware.
- `express`: A lightweight framework for running the server.
- `express-validator`: A middleware for validating the body of requests.
- `mongoose`: An ORM used to work with MongoDB.
- `nunjucks`: A templating engine similar to Jinja.
- `sass`: A preprocessor for making CSS files.

Here are the development dependencies used in the server:
- `cross-env`: Used to run scripts with different environment variables separately.
- `eslint`: Used to analyse the code for neatness.
- `husky`: Used to run pre-commit hooks.
- `mocha`: Used to run tests on the server.
- `nodemon`: Used to run the server and restart the app on file updates.

> _Note: The server runs on Node.js v16. Make sure to update Node if it is not yet updated._

---

## Routes and Pages  
The function `router` in `./src/route.js` is responsible for all the routes and pages related to the server. The function takes in routers from the `routers` folder and uses them in the express app. The pages are generated using templates present in the `templates` folder.

### Routers
Router files are used to separate the functions of different routes. This allows us to maintain all routes in an organized manner. All router files in the `routers` end with `-router.js` and have the following base format.

```js
const router = require('express').Router();
// This router is used to configure the app for a specific route

// GET requests
app.get('/some/route', (req, res, next) => { 
	// some code
	return res.renderFile(template, ctx);
});

// POST requests
app.post('/some/route', (req, res, next) => { 
	// some code
	return res.status(statusCode).send;
	// PS: statusCode is optional.
});

/* 
Notes:
	The next argument is optional in most cases. 
	The functions in the requests can be asynchronous too.
	You can use other routers as well if needed.
*/

module.exports = {
	route: '/route',
	router
};
```

> _**Note:** If you are using another router, make sure it is in a sub-directory of the `routes` directory, or does not end with `-router.js`._

### Templates  
Unlike plain HTML files, we use Nunjucks, a templating engine similar to Jinja which allows us to generate pages using HTML and some context values passed from the router. Most templates used extend from the `_base.njk` template, while there may be cases when a different base template is used.

Each template has the following structure
```jinja
{% extends '_base.njk' %}

{% set thispage = 'Page cartegory on navbar' %}
{% set pagetitle = 'Page Title' %}

{# This is a comment. #}

{% block pagecontent %}
	{#
		Here, you will have the content of the page.
		You can use {{ variable }} to use the value of a variable here.
		You can also use loops, conditional statements and macros. Check the docs to know more.
	#}
{% endblock %}

{% block customjs %}
	{# Make custom JS scripts and use them here. (Requires <script> tags.) #}
{% endblock %}

{% block customcss %}
	{# Make custom CSS styles and use them here. (Requires <style> tags.) #}
{% endblock %}
```

Here are some other blocks and variables which are important:
- `block navbar`: In case you want to rewrite the navbar.
- `pagedesc`: To add a description to the page.
- `scripts`: An array of scripts to include in the server. Can be something like axios, iframe_api, etc.

For more info on what else can be done using Nunjucks, check out the [docs](https://mozilla.github.io/nunjucks/templating.html).

---

## Forms  

Among templates, there are a separate group of templates which use the `_form.njk` template as a base. These templates have a slightly different pattern and some more features. 

```jinja
{% extends '_base.njk' %}
{% import '_form.njk' as forms %}

{% set scripts = ['https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'] %}

{% block pagecontent %}
	{% call forms.form() %}
		{# Form Content #}
	{% endcall %}
{% endblock %}

{% block customcss %}
	{{ forms.formCss() }}
	<style>
		{# Extra Styles #}
	</style>
{% endblock %}

{% block customjs %}
	{{ forms.formFunction() }}
	<script>
		axios.defaults.withCredentials = true;
		axios.defaults.headers.common['X-CSRF-TOKEN'] = '{{ csrfToken }}';

		{# Other Functions #}
	</script>
{% endblock %}
```

For in-depth info about the same, check out the [forms](./docs/forms.md) markdown file.

---

## Styles  
The base style is provided by `mask.scss` in `assets/styles`. The SASS file is compiled into a CSS file and used in the server. For any addition to the style throughout the site, it is recommended to add to the SASS file. The CSS files generated are ignored by git and will be overwritten on in case of any edit to the SASS file. Therefore, it is advised not to touch the CSS files.  
You can also make your own SASS files for styles which will be used in multiple pages. For smaller CSS additions, you can proceed with using the custom css in the templates using customcss blocks.

---

## Database Handler and Schemas  
`mongoose` uses database schemas and models to execute database queries. The server 

### Schemas  
Schemas are used to define the shape of the data we wish to query. The folder `database/schemas` contains all schemas present in the server. The schema files have a PascalCase name, and have the following format

```js
const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
	// object contains key value pairs of all data and their types
});

collectionSchema.set('collection', 'collectionName');
// While this is not necessary to use this always, it is recommended to use.

module.exports = mongoose.model('ModelName', collectionSchema);
```

### Handler  
The file `handler.js` in `database` folder uses all the schemas to make functions which we use in other handler functions as well as the server and tests. 

> _**Note:** Not all functions should be exported from the module. Only export the functions which are used._

---

## Auth System  

The website uses a password auth system using session cookies. You can check the schemas of the [users](../database/Schemas/User.js) and [sessions](../database/Schemas/Session.js) for more info regarding the schema structure. The passwords are stored after hashing using randomly generated salts using `bcrypt`, ensuring the safety of the privacy of the passwords from the team, as well as in the unlikely event of an unexpected leak.

---
## Running the server  
The main file of the server is `server.js` in the `src` folder. The server can be run using `npm run param`, where `param` can be any of the following:
- `dev`: Used while developing. Runs the server using `nodemon`
- `dm`: Short for `dev mongoless`. The server instance runs without being connected to the database.

> It is preferable to use the mongoless instance unless you need to connect to the database. (Faster loading times and lesser resource usage, you can see where I am going with this.)

You can also run the server using `npm start` followed by some flags. The flags include:
- `dev`: Unlike the earlier case, this won't run the server in `nodemon`.
- `local`: Connects to the localhost MongoDB instead of the one provided in credentials.json
- `maintenance`: Used only to display the "Under Maintenance" page.
- `mongoless`: Runs the server without connecting to the database.
- `prod`: Runs the production instance of the server
- `test`: Runs the tests for the server.

The default port for the server is 6970. The test servers run in their own independent ports (`735X`, `X` is some number.) This can be overridden using process variables. (For instance `PORT=6969 npm run dev`.)

The server needs a file `credentials.json` in the `src` folder which contains the database URL and other necessary credentials. You can override the database URL using the process variable MONGO_URL (similar to PORT).

---

## Tests  
To ensure that the code you have written has not broken anything in the server (and is clean) a few tests are run before a commit is made. To run the tests manually, you can run the command `npm run test` to execute all the tests. The tests are done by two dependencies:
- `lint`: Checks for the code formatting. This is responsible for clean code being present in the repository. Check the [ESLint Config](.eslintrc.json) file.
- `mocha`: Runs tests from the `/test` folder. They can be either checking whether the server works properly or if the tools used are working properly.

To run individual tests, you can use `npm run` with the following flags:
- `lint`: Runs the lint test. If you want to run the test while also fixing the potentially fixable errors (like missing semicolons), use `lint-fix` instead. 
- `mocha`: Runs a specific test. You need to mention the file to be run as well. For instance, `npm run mocha ./test/site-maintenance.js`. In order to run all the tests parallelly, use `mocha-all` instead.

---

## Contributions  
Similar to the base repository, we will be having two branches. The `main` branch will be responsible for production releases and the `dev` branch will be responsible for development of new features and working on new stuff.  
All non-trivial contributions made will be to the `dev` branch using pull requests. You can , however, directly make trivial edits and minor bug fixes directly on the `dev` branch.  

> _**Note:** PRs can be made to other branches in the repository as well. For instance, if you are working on the live quiz portal, socket integration and database integration (two separate features) can have their PRs to the live quiz portal's branch, which can further be merged to dev._

The `dev` &#x2192; `main` branch pull requests are the only ones allowed to be made to the `main` branch. They will be made after a few additions are made to `dev`.

### Rules for making a PR
- When you make a new branch for a new feature, be sure to make a pull request. You can set it as a draft, but it is recommended you make one to track the progress easily.
- Don't be lazy with the PR details. Make sure to add a proper title and description to the PR instead of just the base branch's name.
- Make sure your PR is used to merge to the correct branch. We don't want a PR which is supposed to go to the live quiz portal get merged to dev.

Your PR will be approved when two of the following conditions are met:
- Your code passes all the tests (lint, mocha, everything)
- All feedback, suggestions (and excessively redundant additions) asked by the reviewers and team head have been satisfied.
- ~~Bribe the head with something they value~~
> _Note: Equivalent migrations should be made to the database (in case of `dev` &#x2192; `main`.) If necessary, change the production server into a maintenance instance before migrating._

---

## Credits  
### Team Head  
- [Vidunram A R](https://github.com/Goose-Of-War)
### Team Members  
- [Ankan Saha](https://github.com/ItsAnkan)
- [Dishant Bothra](https://github.com/DishantB0411)
- [Jai Sachdev](https://github.com/SachdevJai)
- [Sahil Patel](https://github.com/Symbiot01)
### Content
- Aman Tater
> _will be added as they contribute_
