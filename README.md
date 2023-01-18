# Typrod

Typrod (acronym of "type", "property" and "data"; and abbreviated as TPD) is an [AngularJS](https://angularjs.org) library to synthetize info handlings based on:
- input/output displays and
- value conversions.

:warning: Warnings:
- Here are some words that may create confusion since also are elemental terms of JavaScript, AngularJS, CSS or even SQL. Because of this, for avoid ambiguity, our own concepts will be explicitly designated (e.g. "TPD data").
- We understand that it is a complex system, so we recommend that you read all the documentation before getting started.
- We will show the functioning in the next demos with [Bootstrap](https://getbootstrap.com) as testing framework, but understand that you can really use any.

## Overview

Imagine AngularJS runs, you layout with [Bootstrap 4](https://getbootstrap.com/docs/4.6) and you need to filter, list and edit a data collection. See [here](https://jsfiddle.net/57hb9apr) a improvised live demo (with one filtering `<form>` and one `<table>` to manage records) to be oriented about it. As we can view, usually the following occurs:

1. JSON (normally from an HTTP request) is captured.
2. Its values (if necessary) must to be transformed one by one. In the example, for these types:
   - Datetimes: from string format to `Date` object.
   - Maybe (hypothetical presumption) booleans are rarely passed from an old system with numbers (`0`/`1`). Then, it becomes originals (`true`/`false`).
   - And perhaps a list of options is served (another assumption) as string with IDs joined by commas. It turns into array.
3. The result are displayed inserting manually:
   - Inputs (among others):
     - Dates: with `<input type="date">`.
     - Booleans: checkboxes.
     - Options: `<select>`s.
   - Outputs (the corresponding ones):
     - Dates: typically through [`date`](https://docs.angularjs.org/api/ng/filter/date) filter.
     - Booleans: answering ("Yes"/"No").
     - Options: selected items.
4. To represent these data, facing the user, captions appear situated in `<label>`s and `<th>`s.
5. Once ready, when user interacts, every edition requires the reverse conversion of values to save the change.

Having said that, notice that these steps are repeated continuously for each info. Do you want to build another table? The same again.

Well, so, using Typrod, all of these involving processes can be only-one-time done or excessively reduced. Look [the altered demo](https://jsfiddle.net/jqweskLt) and pay attention to the differences between two systems (extra utilities remains). In this occasion, the procedure is like this:
1. Firstly, some simple settings are defined by a [provider](https://docs.angularjs.org/guide/providers), transmitting:
   1. For each TPD type (datetimes, booleans, options... whatever!):
      - A conversion function.
      - An HTML template of input.
      - Output's.
      - To come back to JSON, another converting.
   2. About TPD components (in our case, table and form), indicating mainly templates.
2. At last, in the HTML coding, empty tags are printed with some attribute [directives](https://docs.angularjs.org/guide/directive) that contains:
   1. The captured values.
   2. A proper array of TPD data (group of TPD properties that indicate TPD type, label, param name, etc.).

And voilà! It is already prepared and automated. For a future TPD component (with similar TPD types), you only need to do the 2nd step, no more!

### Concepts

We will take the previous examples to show samples.

#### TPD type

```js
tpdProvider
	// ...
	.type('options', /*...*/)
	.type('year', /*...*/)
	.type('email', /*...*/)
	.type('boolean', /*...*/);
```

Whatever you can think. No limits. Like simply:

```js
tpdProvider.type('email', {
	/*fromJson: undefined,
	toJson: undefined,*/
	input: '<input type="email" class="form-control">',
	output: '<a ng-href="mailto:{{$tpdProp.value}}">{{$tpdProp.value}}</a>'
});
```

Also we can achieve it thanks to other ways to register:

##### Overwriting

```js
tpdProvider.type('boolean', function (opts) {
	// ...
	return opts;
});
```

Starting from an already added TPD type (`'boolean'` is system built-in), we can define it again. Permitted to pass an object or a function (like here). There is the reserved `'*'` value to apply globally on all:

```js
tpdProvider.type('*', function (opts) {
	// ...
	return opts;
});
```

##### Copying

Similarly to overwrite, a new TPD type can inherit definitions of another one by the copy mechanism.

```js
tpdProvider.type('year', ['number', function (opts) {
	// ...
	return opts;
}]);
```

But it has a quirk: TPD components' ETCs (more info after) will be exactly duplicated.

#### TPD property

```js
[
	// ...
	{
		type: 'number',
		name: 'maxWeight',
		label: 'maxWeight',
		required: true
	},
	// ...
]
```

This is each of instances of a certain TPD type (and other several fits) whose a double TPD values (see below) are part of.

##### TPD value

```html
<form tpd-values="..."></form>
<table tpd-values="..."></table>
```

Handled in conversions whose two kinds are:

###### JSON

```js
{
	id: 2,
	name: 'Noah Baker',
	gender: 'f',
	birthdate: '1963-11-28',
	weight: 85.12,
	email: 'tur@jedigfu.eg',
	isForeign: 0
}
```

Original values arranged in JSON.

###### Formatted

```js
{
	// ...
	birthdate: new Date('1963-11-28'),
	// ...
	isForeign: false
}
```

Transformed (if is needed) from aforesaid, and gave back too (cyclic process).

##### TPD container

```html
<div class="form-group">
	<label for="..." translate="..."></label>
	<input type="..." class="form-control" id="..." ng-model="...">
</div>
...
```

```html
<th scope="col" translate="..."></th>
...
```

```html
<td>
	<input type="..." class="form-control" ng-model="..." ng-if="...">
	<span ng-if="...">...</span>
</td>
...
```

The repeated tags, corresponding each to a TPD property, that contains an appropriate HTML content.

###### ETC

It may happen that, for a concrete TPD component, we find a particular TPD type which is not structured than regularly. Take a look:

```html
<div class="form-group form-check">
	<input type="checkbox" class="form-check-input" id="..." ng-model="...">
	<label class="form-check-label" for="..." translate="..."></label>
</div>
```

So, you can define this too. We know it as exceptional TPD container (ETC).

#### TPD data

Grouping of TPD properties. Paste the following attribute to TPD components:

```html
<form tpd-data="..."></form>
<table tpd-data="..."></table>
```

And let Typrod start to deploy all its mechanism.

#### TPD component

In our case: `<form>...</form>` and `<table>...</table>`. Determined like:

```js
tpdProvider.component('form', /*...*/, { /*...*/ });
```

And:

```js
tpdProvider.component('table', /*...*/);
```

It is possible customize any tag with any classname, attribute, parent... Here you have some varied samples:

```js
tpdProvider
	.component('form', /*...*/)
	.component('form.form-horizontal', /*...*/)
	.component('table.table.table-striped', /*...*/)
	.component('form[ng-submit]', /*...*/)
	.component('form.form-inline[ng-submit]', /*...*/)
	.component('tbody > tr', /*...*/)
	.component('form + table', /*...*/);
```

##### TPD content

Full internal HTML included in TPD components. Concatenation of TPD container and extra elements.

### Advantages

Why to use Typrod?:
- Code extremely simplified. On the principle of "Write less, do more".
- Clear distinction between representation (HTML structure, class names, styles, etc.) and logical (what kind of data is it, param name, labelling, requirement, etc.). And in consequence:
  - Centralization. Full logics are dumped into [controllers](https://docs.angularjs.org/guide/controller), not also partially in its views.
  - Abstraction of core data, assuming that TPD properties can share homologous behaviours.
- More maintainable and reliable source code.
  - Integrated reutilization of mechanisms.
  - Uniformity, homogeneity and consistency.
  - Possible human mistakes avoided on bad-writing, forgetting...
  - Easy and fast to migrate CSS frameworks.
- Unlimited customization. Not adaptive to any particular CSS dependencies.
- Well-known system, not new or weird:
  - Specifications of TPD data are similar to databases', like in SQL table creations (column name, datatype, mandatory...).
  - Use of a worldwide standard data-interchange format such as JSON.
  - TPD components are descripted by CSS syntax.
- Flexibility, adaptability and variety on function arguments and option values.

## Install

By NPM or with CDN embeds:

### NPM

```sh
npm install typrod
```

Then import TPD and add it as a dependency for your app:

```js
angular.module('myApp', [require('typrod')]);
```

### CDN

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

## Usage

Typrod sets by a provider and gets by a service.

### Provider

It is named `tpdProvider`, whose methods (of which the setters and deleters return it, allowing chaining) are:

#### `.type( name, opts )`

Sets a TPD type.

<table>
<tr><th>Param</th><th>Type</th><th>Details</th></tr>
<tr><td><code>name</code></td><td>String</td><td>Name.</td></tr>
<tr><td rowspan="4"><code>opts</code></td><td>Object</td><td>Options (see the next section).</td></tr>
<tr><td>Function</td><td>To overwrite:<ul><li>Argument: the original (without defaults) options.</li><li>Return: new ones (obj.).</li></ul></td></tr>
<tr><td>Array</td><td>Name of copied TPD type and options (obj. or fn., like above).</td></tr>
<tr><td>Null</td><td>To remove just as <code>removeType</code> does.</td></tr>
</table>

##### Options

<table>
<tr><th>Key(s)</th><th>Type</th><th colspan="2">Details</th><th>Default</th></tr>
<tr><td><code>fromJson</code></td><td rowspan="2">Function</td><td>TPD value conversion from JSON.</td><td rowspan="2"><ul><li>Argument: TPD value to convert.</li><li>Return: converted one.</li></ul></td><td><code>angular.identity</code></td></tr>
<tr><td><code>toJson</code></td><td>The same to JSON.</td><td>Caller of own <code>toJSON</code> method (if exists)</td></tr>
<tr><td rowspan="4"><code>input</code></td><td>String</td><td rowspan="5">HTML template.</td><td>Tagged <a href="https://api.jquery.com/Types/#htmlString">HTML string</a>. If multi-level or multiple tags, you have to mark the main input element by <code>tpd-target</code> attribute.</td><td rowspan="4">Current definition of <code>'string'</code> TPD type</td></tr>
<tr><td>Object</td><td>DOM element</td></tr>
<tr><td>Function</td><td><ul><li>Argument: directive's scope.</li><li>Return: elem. (str. or obj.).</li></ul></td></tr>
<tr><td>Array</td><td>Collection of the mentioned types (string, function... or even, allowing unlimited nesting, another array!) that will be joined.</td></tr>
<tr><td><code>output</code></td><td>Same as above</td><td>Use <code>$tpdProp.value</code> to manage the value.</td><td><code>'&lt;span&gt;{{$tpdProp.value}}&lt;/span&gt;'</code></td></tr>
</table>

#### `.type( name )`

Gets it.

#### `.removeType( name )`

Removes it and also in ETCs. Exceptionally, `'string'` is undeletable.

#### `.component( selector, content [, ec ] )`

Sets a TPD component.

<table>
<tr><th>Param</th><th>Type</th><th>Details</th></tr>
<tr><td><code>selector</code></td><td>String</td><td>CSS selector.</td></tr>
<tr><td rowspan="4"><code>content</code></td><td>String</td><td>TPD content.</td></tr>
<tr><td>Array</td><td>Joining array, like option <code>input</code>, but with an extra type: function.<ul><li>Argument: selector's element.</li><li>Return: the string.</li></ul></td></tr>
<tr><td>Function</td><td>To overwrite:<ul><li>Argument: the original.</li><li>Return: new one (str. and array).</li></ul></td></tr>
<tr><td>Null</td><td>To remove just as <code>removeComponent</code> does.</td></tr>
<tr><td rowspan="2"><code>ec</code> (optional)</td><td>Object</td><td>Exceptional TPD containers. With keys as TPD type names while each value are composed by its TPD container as string or joining array.</td></tr>
<tr><td>Function</td><td>To overwrite:<ul><li>Argument: the original.</li><li>Return: new one (obj.).</li></ul></td></tr>
</table>

When Typrod activates, collects the coincidences and priors the TPD component of most [CSS specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) and oldest.

#### `.component( selector )`

Gets it (array with `content` and maybe `ec`).

#### `.removeComponent( selector )`

Removes it.

### Service

`tpd` has two methods that return the corresponding read-only stored (all types transformed to unified-as-possible string except functions) register: `.types()` (as object) and `.components()` (array). Its direct execution (`tpd()`) proportinates an object with both registers.

### Directives

All of these should only be used in TPD contents and ETCs, except the first one (whose utilitation is free).

#### `tpd-data`

Put this attribute over the TPD component tag you want to locate the concerning TPD content. It contains an array where each object must to be formed as:

Key(s) | Type | Details
------ | ---- | -------
`type` (optional) | String | Name of registered TPD type. Defaults to `'string'`.
`name` | String | Name of param (where TPD value is stored).
`label` | String | Caption text (HTML markup available) of tag with `tpd-label`.
`required` (optional) | Boolean | Input mandatority.
`min`/`max` (optional) | Any | Minimum/maximum of TPD value.

And other custom ones are permitted for a not-generic using.

Also it is possible to shorthand it putting an array, instead of the object, following this order: `name`, `label`, `required`, `type` and the rest (in an object). So `['isForeign', 'foreign?', false, 'boolean', { customKey1: 'one', customKey2: 'two' }]` equals to `{ type: 'boolean', name: 'isForeign', label: 'foreign?', required: false, customKey1: 'one', customKey2: 'two' }`.

Besides, accompanying this directive, in the same tag, `tpd-values` is placed, determining the TPD JSON values (manipulated by `fromJson` and `toJson`). This pure attribute is optative but its exclusion has no much sense.

#### `tpd-prop`

Ubicated as attribute solely on TPD containers, Typrod turns these into a repeatedly rendered element by `ng-repeat` that generates `$tpdProp` as local scope variable derived from each `tpd-data`'s item (saving TPD formatted value in `value` property).

If a serie of adjacent elements must to be repeated (instead of just one), substitute this directive with `tpd-prop-start` and `tpd-prop-end` as [`ng-repeat-start` and `ng-repeat-end` do](https://docs.angularjs.org/api/ng/directive/ngRepeat#special-repeat-start-and-end-points).

#### `tpd-label`

Labels the attributed element.

#### `tpd-input`/`tpd-output`

As tagnames, these ones are substituted by the HTML of correspondent options of TPD types.

## Predefinitions

Typrod proportions some built-in registrations:

### TPD types

Name | Details
---- | -------
`'string'` | For single-line text.
`'search'` | Text too but within `<input type="search">`.
`'password'` | Outputs hiding chars too.
`'number'`
`'range'` | Percentage.
`'boolean'`
`'date'`
`'time'`
`'datetime'`
`'option'` | Single `<select>`. You only must to transfer a string of scope's array (formed by objects with pairs `id`-`label`) to `tpd-data` in `options` key.
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

- `'table'`: shows a labeled head and record rows. Place attribute `data-tpd-values` as we make on simple `tpd-values` but with an array.
- `'thead, tfoot'`: labels `<th>`s.
- `'tbody > tr'`: outputs `<td>`s.