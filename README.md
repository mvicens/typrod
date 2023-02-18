# Typrod

Typrod (acronym of "type", "property" and "data"; and abbreviated as TPD) is an [AngularJS](https://angularjs.org) library to automate and synthetize data handling based on:
- templates and
- value conversions.

## Get started

### Install

By NPM or with CDN embeds:

#### NPM

```sh
npm install typrod
```

Then import TPD and add it as a dependency:

```js
angular.module('myApp', [require('typrod')]);
```

#### CDN

```html
<script src="https://unpkg.com/angular@1.8.3/angular.js"></script>
<script src="https://unpkg.com/jquery@3.6.1"></script>
<script src="https://unpkg.com/specificity@0.4.1"></script>
<script src="https://unpkg.com/lodash@4.17.21"></script>
<script src="https://unpkg.com/typrod/dist/typrod.js"></script>
```

```js
angular.module('myApp', ['tpd']);
```

### Usage

Register, in a controller, this array with such object...

```js
$scope.data = [
	{
		name: 'sentence',
		type: 'string',
		label: 'Sentence'
	}
];
```

... and bind it to a form in this way:

```html
<form tpd-data="data"></form>
```

An `<input>` (next to its own associated `<label>`) and a submit `<button>` are rendered within.

Now add another two similar items as:

```diff
		label: 'Sentence'
-	}
+	},
+	{
+		name: 'startDay',
+		type: 'date',
+		label: 'Start day'
+	},
+	{
+		name: 'isOk',
+		type: 'boolean',
+		label: 'It\'s okay?'
+	}
];
```

It finally results:

```html
<form>
	<div>
		<label for="sentence">Sentence</label>
		<input type="text" id="sentence">
	</div>
	<div>
		<label for="startDay">Start day</label>
		<input type="date" id="startDay">
	</div>
	<div><label><input type="checkbox"> It's okay?</label></div>
	<button>Submit</button>
</form>
```

Well, you are taking built the visual montage, nice, but you cannot manage the logic yet. To achieve it, you must to use a 2nd attribute...

```diff
-	<form tpd-data="data"></form>
+	<form tpd-data="data" tpd-values="values"></form>
```

... with an object like:

```js
{
	sentence: 'Hello, world!',
	startDay: '2021-09-13',
	isOk: true
}
```

(It is important that each property key matches the previous `name`).

Change the form controls and the values object will be modified too. Also notice that unexpectedly the date value used in the view is not really a string but a instance of `Date`. There is a two-way transformation.

It looks some needy to get styles, right? No problem! Load your favorite CSS framework and adjust the composed HTML [using the API](#api).

## Concepts

:warning: Warnings:
- Here are some words that may create confusion since also are elemental terms of JavaScript, AngularJS, CSS or even SQL. Because of this, for avoid ambiguity, our own concepts will be explicitly designated (e.g. "TPD data").
- We will take the previous examples to show samples.
- This information is very useful: All of these terms will be named later.

```js
[ // TPD data
	{ // TPD property
		name: 'sentence',
		type: 'string', // TPD type
		label: 'Sentence'
	},
	// ...
];
```

### TPD type

Determines the kind of info. It can be whatever you can think. No limits.

### TPD property

This is each of instances of a certain [TPD type](#tpd-type) (and other several fits) whose a double [TPD values](#tpd-value) are part of.

### TPD data

Grouping of [TPD properties](#tpd-property).

```js
{ // TPD JSON values
	sentence: 'Hello, world!',
	startDay: '2021-09-13',
	isOk: true
}
```

```js
{ // TPD formatted values
	// ...
	startDay: new Date('2021-09-13'),
	// ...
}
```

### TPD value

Handled in conversions whose two kinds are:

#### JSON

Original values arranged in JSON.

#### Formatted

Transformed (if is needed) from aforesaid and gave back too (cyclic process).

```html
<form><!-- TPD component -->
	<!-- TPD content -->
	<div><!-- TPD container -->
		<label for="...">...</label>
		<input type="text" id="...">
	</div>
	...
	<div><label><input type="checkbox"> ...</label></div><!-- ETC -->
	<button>Submit</button>
	<!-- End of TPD content -->
</form>
```

### TPD component

Any tag with any classname, attribute, parent...

### TPD content

Full internal HTML included in [TPD components](#tpd-component); concatenation of [TPD container](#tpd-container) and extra elements.

### TPD container

The repeated tags, corresponding each to a [TPD property](#tpd-property), that contains an appropriate HTML content.

#### ETC

It may happen that, for a concrete [TPD component](#tpd-component), we find a particular [TPD type](#tpd-type) which is not structured than regularly.

We know it as exceptional [TPD container](#tpd-container) (ETC).

## Advantages

Why to use Typrod?:
- Code extremely simplified. On the principle of "Write less, do more".
- Clear distinction between representation (HTML structure, class names, styles, etc.) and logical (what kind of data is it, param name, labelling, requirement, etc.). And in consequence:
  - Centralization. Full logics are dumped into controllers, not also partially in its views.
  - Abstraction of core data, assuming that [TPD properties](#tpd-property) can share homologous behaviours.
- More maintainable and reliable source code.
  - Integrated reutilization of mechanisms.
  - Uniformity, homogeneity and consistency.
  - Possible human mistakes avoided on bad-writing, forgetting...
  - Easy and fast to migrate CSS frameworks.
- Unlimited customization. Not adaptive to any particular CSS dependencies.
- Well-known system, not new or weird:
  - Specifications of [TPD data](#tpd-data) are similar to databases', like in SQL table creations (column name, datatype, mandatory...).
  - Use of a worldwide standard data-interchange format such as JSON.
  - [TPD components](#tpd-component) are descripted by CSS syntax.
- Flexibility, adaptability and variety on function arguments and option values.

## API

Typrod sets and gets by a provider and a service.

### Provider

It is named `tpdProvider`, whose methods (of which the setters and deleters return it, allowing chaining) are:

#### `.type( name, opts )`

Sets a [TPD type](#tpd-type).

<table>
<tr><th>Param</th><th>Type</th><th>Details</th></tr>
<tr><td><code>name</code></td><td>String</td><td>Name. The <code>'*'</code> is reserved to apply globally.</td></tr>
<tr><td rowspan="4"><code>opts</code></td><td>Object</td><td><a href="#options">Options</a>.</td></tr>
<tr><td>Function</td><td>To overwrite:<ul><li>Argument: the original (without defaults) <a href="#options">options</a>.</li><li>Return: new ones (obj.).</li></ul></td></tr>
<tr><td>Array</td><td>To copy. Whose items are:<ul><li>Name of copied <a href="#tpd-type">TPD type</a>.</li><li><a href="#options">Options</a> (obj. or fn., like above).</li></ul>Besides, <a href="#etc">ETCs</a> are duplicated.</td></tr>
<tr><td>Null</td><td>To remove just as <a href="#removetype-name-"><code>removeType</code></a> does.</td></tr>
</table>

##### Options

<table>
<tr><th>Key(s)</th><th>Type</th><th colspan="2">Details</th><th>Default</th></tr>
<tr><td><code>fromJson</code></td><td rowspan="2">Function</td><td><a href="#tpd-value">TPD value</a> conversion from <a href="#json">JSON</a>.</td><td rowspan="2"><ul><li>Argument: <a href="#tpd-value">TPD value</a> to convert.</li><li>Return: converted one.</li></ul></td><td><code>angular.identity</code></td></tr>
<tr><td><code>toJson</code></td><td>The same to <a href="#json">JSON</a>.</td><td>Caller of own <code>toJSON</code> method (if exists)</td></tr>
<tr><td rowspan="4"><code>input</code></td><td>String</td><td rowspan="5">HTML template.</td><td>If multi-level or multiple tags, you have to mark the main input element by <code>tpd-target</code> attribute.</td><td rowspan="4">Current definition of <a href="#tpd-type">TPD type</a> <code>'string'</code></td></tr>
<tr><td>Object</td><td>DOM element</td></tr>
<tr><td>Function</td><td><ul><li>Argument: read-only <a href="#tpdprop"><code>$tpdProp</code></a>.</li><li>Return: templ. (str., obj. or array).</li></ul></td></tr>
<tr><td>Array</td><td>Collection of the mentioned types (string, function... or even, allowing unlimited nesting, another array!) that will be joined.</td></tr>
<tr><td><code>output</code></td><td>Same as above</td><td>Use <a href="#tpdvalue"><code>$tpdValue</code></a> to manage the value.</td><td><code>'&lt;span&gt;{{$tpdValue}}&lt;/span&gt;'</code></td></tr>
</table>

#### `.type( name )`

Gets it.

#### `.removeType( name )`

Removes it and also in [ETCs](#etc). Exceptionally, `'string'` is undeletable.

With `name` as array of strings, it can be applied over more than one [TPD type](#tpd-type).

#### `.component( selector, content [, ec ] )`

Sets a [TPD component](#tpd-component).

<table>
<tr><th>Param</th><th>Type</th><th>Details</th></tr>
<tr><td><code>selector</code></td><td>String</td><td>CSS selector.</td></tr>
<tr><td rowspan="3"><code>content</code></td><td>Same as <a href="#options">option <code>input</code></a>, except for the following</td><td><a href="#tpd-content">TPD content</a>. Functions can be used inside joining arrays, with selector's element (read-only) as argument.</td></tr>
<tr><td>Function</td><td>To overwrite:<ul><li>Argument: the original.</li><li>Return: new one.</li></ul></td></tr>
<tr><td>Null</td><td>To remove just as <a href="#removecomponent-selector-"><code>removeComponent</code></a> does.</td></tr>
<tr><td rowspan="2"><code>ec</code> (optional)</td><td>Object</td><td><a href="#etc">ETCs</a>. With keys as <a href="#tpd-type">TPD type</a> names while each value are formed by its <a href="#tpd-container">TPD container</a> with types like <a href="#options">option <code>input</code></a>.</td></tr>
<tr><td>Function</td><td>To overwrite:<ul><li>Argument: the original.</li><li>Return: new one (obj.).</li></ul></td></tr>
</table>

When Typrod activates, collects the coincidences and priors the [TPD component](#tpd-component) of most [CSS specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) and oldest.

#### `.component( selector )`

Gets it (array with `content` and maybe `ec`).

#### `.removeComponent( selector )`

Removes it.

### Service

`tpd` has two methods that return the corresponding read-only stored (all types transformed as possible to string) register: `.types()` (as object) and `.components()` (array).

Its direct execution (`tpd()`) proportinates an object with both registers.

## Directives

All of these should only be used in [TPD contents](#tpd-content) and [ETCs](#etc), except the first one (whose utilitation is free).

### `tpd-data`

Put this attribute over the [TPD component](#tpd-component) tag you want to locate the concerning [TPD content](#tpd-content). It contains an array where each object must to be formed as:

Key(s) | Type | Details
------ | ---- | -------
`type` (optional) | String | Name of registered [TPD type](#tpd-type). Defaults to `'string'`.
`name` | String | Name of param (where [TPD value](#tpd-value) is saved) and a glue between [its directive](#tpd-data-1) and this current one.
`label` | String | Caption text (HTML markup available) of tag with [`tpd-label`](#tpd-label).
`required` (optional) | Boolean | Input mandatority.
`min`/`max` (optional) | Any | Minimum/maximum of [TPD value](#tpd-value).

And other custom ones are permitted for a not-generic using.

#### Shorthand

Also it is possible to reduce it putting an array (instead of the entire object) following this order: `name`, `label`, `required`, `type` and the rest (in an object).

So, `['isOk', 'OK?', false, 'boolean', { customKey1: 'one', customKey2: 'two' }]` equals to `{ type: 'boolean', name: 'isOk', label: 'OK?', required: false, customKey1: 'one', customKey2: 'two' }`.

#### `tpd-values`

Besides, accompanying this directive, in the same tag, `tpd-values` is placed, determining the [TPD JSON values](#json) (manipulated by `fromJson` and `toJson`). This pure attribute is optative but its exclusion has no much sense.

### `tpd-prop`

Ubicated as attribute solely on [TPD containers](#tpd-container), Typrod turns these into a repeatedly instantiated element by `ng-repeat` and generates these scope variables:

#### `$tpdValues`

[TPD formatted values](#formatted), opposite reflection of [`tpd-values`](#tpd-values)'s.

#### `$tpdProp`

Relative to each [`tpd-data`](#tpd-data-1)'s item, it is formed by object of [TPD property](#tpd-property).

#### `$tpdValue`

The correspondent [TPD formatted value](#formatted), of each item too.

### `tpd-prop-start`/`tpd-prop-end`

If a serie of adjacent elements must to be repeated (instead of just one), substitute this directive with `tpd-prop-start` and `tpd-prop-end` as [`ng-repeat-start` and `ng-repeat-end` do](https://docs.angularjs.org/api/ng/directive/ngRepeat#special-repeat-start-and-end-points).

### `tpd-label`

Labels the attributed element.

### `tpd-input`/`tpd-output`

As tagnames, these ones are substituted by the extracted HTML of correspondent [options](#options) of [TPD types](#tpd-type).

## Predefinitions

Typrod proportions some built-in registrations:

### TPD types

Name | Details | Extra [`tpd-data`](#tpd-data-1)'s keys
---- | ------- | -----------------------
`'string'` | For single-line text.
`'search'` | Text too but within `<input type="search">`.
`'password'` | Outputs hiding characters.
`'text'` | Multi-line. | To define the rows number, `rows`.
`'number'`
`'range'` | Percentage.
`'boolean'`
`'date'`
`'time'`
`'datetime'`
`'week'`
`'month'`
`'option'` | Single `<select>`. | To fill its list, `options` with a string of scope's array (formed by objects with pairs `id`-`label`).
`'options'` | The same but multiple.
`'color'` | Hexadecimal color.
`'url'` | URL.
`'email'` | E-mail address.
`'tel'` | Telephone number.

### TPD components

#### Forms

You have namesake `'form'`. It rawly prints `<div>`s with `<label>` and input, and a submit button. You have to add the `ng-submit` directive by yourself and `data-name` attribute as namespace of labelable elements.

#### Description lists

`<dl>`s exposes labels in `<dt>`s and outputs in `<dd>`s.

#### Tables

- `'table'`: shows a labeled head and record rows. Place attribute `data-tpd-values` with an array whose every item will be captured by [`tpd-values`](#tpd-values).
- `'thead, tfoot'`: labels `<th>`s.
- `'tbody > tr'`: outputs `<td>`s.