# Typrod

Typrod (acronym of "type", "property" and "data"; and abbreviated as TPD) is an [AngularJS](https://angularjs.org) library to synthetize info handlings based on values conversions and input/output displays.

:warning: Warnings:
* Here are some words that may create confusion since also are elemental terms of JavaScript, AngularJS, CSS or even SQL. Because of this, for avoid ambiguity, our own concepts will be explicitly designated (e.g. "TPD data").
* We understand that it is a complex system, so we recommend that you read all the documentation before getting started.
* We will show the functioning in the next demos with [Bootstrap](https://getbootstrap.com) as testing framework, but understand that you can really use any.

## Overview

Imagine AngularJS runs, you layout with [Bootstrap 4](https://getbootstrap.com/docs/4.6) and you need to filter, list and edit a data collection. See [here](https://jsfiddle.net/57hb9apr) a improvised live demo (with one filtering `<form>` and one `<table>` to manage records) to be oriented about it. As we can view, usually the following occurs:

1. JSON (normally from an HTTP request) is captured.
2. Its values (if necessary) must to be transformed one by one. In the example, for these types:
   * Datetimes: from string format to `Date` object.
   * Maybe (hypothetical presumption) booleans are rarely passed from an old system with numbers (`0`/`1`). Then, it becomes originals (`true`/`false`).
   * And perhaps a list of options is served (another assumption) as string with IDs joined by commas. It turns into array.
3. The result are displayed inserting manually:
   * Inputs (among others):
     * Dates: with `<input type="date">`.
     * Booleans: checkboxes.
     * Options: `<select>`s.
   * Outputs (the corresponding ones):
     * Dates: typically through [`date`](https://docs.angularjs.org/api/ng/filter/date) filter.
     * Booleans: answering ("Yes"/"No").
     * Options: selected items.
4. To represent these data, facing the user, captions appear situated in `<label>`s and `<th>`s.
5. Once ready, when user interacts, every edition requires the reverse conversion of values to save the change.

Having said that, notice that these steps are repeated continuously for each info. Do you want to build another table? The same again.

Well, so, using Typrod, all of these involving processes can be only-one-time done or excessively reduced. Look [the altered demo](https://jsfiddle.net/jqweskLt) and pay attention to the differences between two systems (extra utilities remains). In this occasion, the procedure is like this:
1. Firstly, some simple settings are defined by a [provider](https://docs.angularjs.org/guide/providers), transmitting:
   1. For each TPD type (datetimes, booleans, options... whatever!):
      * A conversion function.
      * An HTML template of input.
      * Output's.
      * To come back to JSON, another converting.
   2. About TPD components (in our case, table and form), indicating mainly templates.
2. At last, in the HTML coding, empty tags are printed with some attribute [directives](https://docs.angularjs.org/guide/directive) that contains:
   1. The captured values.
   2. A proper array of TPD data (group of TPD properties that indicate TPD type, label, param name, etc.).

And voilà! It is already prepared and automated. For a future TPD component (with similar TPD types), you only need to do the 2nd step, no more!

### Concepts

We will take the previous examples to show samples.

#### TPD type

```js
$tpdProvider
	/*...*/
	.type('options', /*...*/)
	.type(['year', 'y'], /*...*/)
	.type('email', /*...*/)
	.type('boolean', /*...*/);
```

Whatever you can think. No limits. Like simply:

```js
$tpdProvider.type('email', {
	/*fromJson: undefined,
	toJson: undefined,*/
	input: '<input type="email" class="form-control">',
	output: '<a ng-href="mailto:{{$property.value}}">{{$property.value}}</a>'
});
```

To speed up settings, every TPD type name can be referenced by one or more aliases. So, instead of write entirely `'string'`, `'number'`, `'boolean'`, `'email'` or e.g. custom `'anotherNewType'`, you can put abbreviated `'s'`, `'n'`, `'b'`, `'e'` and `'ant'`. Regarding the above, through:

```js
$tpdProvider.type(['email', 'e', 'em'], /*...*/);
```

And linked to TPD data (explained later) like e.g.:

```js
[
	// ...
	{
		type: 'e',
		// ...
	},
	// ...
]
```

Also we can achieve it thanks to other ways to register:

##### Overwriting

```js
$tpdProvider.type('boolean', function (opts) {
	// ...
	return opts;
});
```

Starting from an already added TPD type (`'boolean'` is system built-in), we can define it again. Permitted to pass an object or a function (like here). And you must to indicate either its name (not alias) or the reserved `'*'` value to apply globally on all:

```js
$tpdProvider.type('*', function (opts) {
	// ...
	return opts;
});
```

##### Copying

Similarly to overwrite, a new TPD type can inherit definitions of another one by the copy mechanism.

```js
$tpdProvider.type(['year', 'y'], ['number', function (opts) {
	// ...
	return opts;
}]);
```

But it has a quirk: TPD components' ETC (more info after) will be exactly duplicated.

#### TPD property

```js
[
	// ...
	{
		type: 'n',
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

###### Exceptional

It may happen that, for a concrete TPD component, we find a particular TPD type which is not structured than regularly. Take a look:

```html
<div class="form-group form-check">
	<input type="checkbox" class="form-check-input" id="..." ng-model="...">
	<label class="form-check-label" for="..." translate="..."></label>
</div>
```

So, you can define this too. We know it as exceptional TPD container (ETC).

#### TPD data

Grouping of TPD properties. Paste the following attribute to components:

```html
<form tpd-data="..."></form>
<table tpd-data="..."></table>
```

And let Typrod start to deploy all its mechanism.

#### TPD component

In our case: `<form>...</form>` and `<table>...</table>`. Determined like:

```js
$tpdProvider.component('form', /*...*/, { /*...*/ });
```

And:

```js
$tpdProvider.component('table', /*...*/);
```

It is possible customize any tag with any classname, attribute, parent... Here you have some varied samples:

```js
$tpdProvider
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

The advantages in using Typrod are:
* Code extremely simplified. On the principle of "Write less, do more".
* Clear distinction between representation (HTML structure, attributes, class names, etc.) and logical (what kind of TPD type is it, param name, label, requirement, order, etc.). And in consequence:
  * Centralization. Full logics are dumped into [controllers](https://docs.angularjs.org/guide/controller), not partially in its views.
  * Abstraction of core data, assuming that TPD properties can share homologous behaviours.
* More maintainable and reliable source code.
  * Integrated reutilization of mechanisms.
  * Uniformity and consistency: homogenized templates and conversions.
  * Possible human mistakes avoided. For example, on bad-written inputs, missing conversions of e.g. datetimes, etc.
  * Easy and fast to migrate frameworks.
* Unlimited customization. Not adaptive to any particular CSS dependencies.
* Well-known system, not new or weird:
  * Specifications of TPD data are similar to databases', like in SQL table creations (column name, datatype, mandatory...).
  * Use of a worldwide standard data-interchange format such as JSON.
  * TPD components are descripted by CSS syntax.
* Flexibility, adaptability and variety on methods arguments and options values.
* Clean code.

## Install

### NPM

```sh
npm install typrod
```

Then import JQuery and AngularJS (important to do this way!) and add TPD as a dependency for your app:

```js
const $ = require('jquery');
window.jQuery = $; // To set it as alias of "angular.element"
require('angular');

angular.module('myApp', [require('typrod')]);
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.js"></script>
<script src="https://cdn.jsdelivr.net/npm/angular@1/angular.js"></script>
<script src="https://cdn.jsdelivr.net/npm/angular-translate@2/dist/angular-translate.js"></script>
<script src="https://cdn.jsdelivr.net/npm/specificity@0/dist/specificity.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4/lodash.js"></script>
<script src="https://cdn.jsdelivr.net/npm/typrod@1/typrod.js"></script>
```

```js
angular.module('myApp', ['tpd']);
```

## Usage

TPD sets by a provider and gets by a service.

### Provider

It is named `$tpdProvider`, whose methods (that all return it, allowing chaining) are:

#### `type(name, opts)`

Registers a TPD type.

<table>
<tr><th>Param</th><th>Type</th><th>Details</th></tr>
<tr><td rowspan="2"><code>name</code></td><td>String</td><td>Name.</td></tr>
<tr><td>Array</td><td>Name followed by its alias(es).</td></tr>
<tr><td rowspan="3"><code>opts</code></td><td>Object</td><td>Options (see the next section).</td></tr>
<tr><td>Function</td><td>To overwrite:<ul><li>Argument: the original options.</li><li>Return: new ones (obj.).</li></ul></td></tr>
<tr><td>Array</td><td>Name of copied TPD type and options (obj. or fn., like above).</td></tr>
</table>

##### Options

<table>
<tr><th>Key(s)</th><th>Type</th><th colspan="3">Details</th><th>Default</th></tr>
<tr><td rowspan="3"><code>fromJson</code>/<code>toJson</code></td><td>Function</td><td rowspan="3">TPD value conversion from/to JSON.</td><td colspan="2"><ul><li>Argument: TPD value to convert.</li><li>Return: converted one.</li></ul></td><td rowspan="3"><code>angular.identity</code> / caller of own <code>toJSON</code> method (if exists)</td></tr>
<tr><td>String</td><td>Name of <a href="https://docs.angularjs.org/guide/services">factory/service</a>.</td><td rowspan="2">A fn. like before is extracted.</td></tr>
<tr><td>Array</td><td>Fact./serv. in <a href="https://docs.angularjs.org/guide/di#inline-array-annotation">inline array annotation</a>.</td></tr>
<tr><td rowspan="6"><code>input</code></td><td rowspan="2">String</td><td rowspan="8">HTML template.</td><td colspan="2">Tagged <a href="https://api.jquery.com/Types/#htmlString">HTML string</a>. If multi-level or multiple tags, you have to mark the main input element by <code>tpd-target</code> attribute.</td><td rowspan="6">Current definition of <code>'string'</code> TPD type</td></tr>
<tr><td>Name of <a href="https://docs.angularjs.org/guide/services">fact./serv.</a></td><td rowspan="2">Fn. extraction.</td></tr>
<tr><td>Array</td><td>Fact./serv. in <a href="https://docs.angularjs.org/guide/di#inline-array-annotation">IAA</a>.</td></tr>
<tr><td rowspan="2">Object</td><td colspan="2"><a href="https://api.jquery.com/Types/#jQuery">JQuery element</a>.</td></tr>
<tr><td colspan="2">DOM elem.</td></tr>
<tr><td>Function</td><td colspan="2"><ul><li>Argument: directive's scope.</li><li>Return: elem. (obj. or str.).</li></ul></td></tr>
<tr><td rowspan="2"><code>output</code></td><td>String</td><td colspan="2">Any string (plain texts, tags, interpolations...).</td><td rowspan="2"><code>'{{$property.value}}'</code></td></tr>
<tr><td>Function</td><td colspan="2"><ul><li>Argument: the scope.</li><li>Return: the string.</li></ul></td></tr>
</table>

#### `component(selector, content, [ec])`

Registers a TPD component.

<table>
<tr><th>Param</th><th>Type</th><th>Details</th></tr>
<tr><td><code>selector</code></td><td>String</td><td>CSS selector.</td></tr>
<tr><td rowspan="2"><code>content</code></td><td>String</td><td>TPD content.</td></tr>
<tr><td>Function</td><td><ul><li>Argument: selector's JQuery element.</li><li>Return: the string.</li></ul></td></tr>
<tr><td><code>ec</code> (optional)</td><td>Object</td><td>Exceptional TPD containers. With keys as TPD type names while each value are composed by its TPD container with the same types than <code>content</code> (2nd param).</td></tr>
</table>

Overwriting (but basic one) is also allowed.

When Typrod activates, collects the coincidences and priors the TPD component of most [CSS specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) and oldest.

### Service

`$tpd()` proportinates a read-only object of original setters (without defaults) of registers. Regarding the TPD components, its function arguments are disposed in arrays. And the TPD type aliases appears too, grouped by names.

### Directives

All of these should only be used in TPD contents and ETCs, except the first one (whose utilitation is free).

#### `tpd-data`

Put this attribute over the TPD component tag you want to locate the concerning TPD content. It contains an array where each object must to be formed as:

Key(s) | Type | Details
------ | ---- | -------
`type` (optional) | String | Name or alias of registered TPD type. Defaults to `'string'`.
`name` | String | Name of param (where TPD value is stored).
`label` | String | Translation ID of [Angular Translate](https://angular-translate.github.io).
`required` (optional) | Boolean | Input mandatority.
`min`/`max` (optional) | Any | Minimum/maximum of TPD value.

And other custom ones are permitted for a not-generic using.

Besides, accompanying this directive, in the same tag, `tpd-values` is placed, determining the TPD JSON values (manipulated by `fromJson` and `toJson`). This pure attribute is optative but its exclusion has no much sense.

#### `tpd-property`

Ubicated as attribute solely on TPD containers, Typrod turns these into a repeatedly rendered element by `ng-repeat` that generates `$property` as local scope variable derived from each `tpd-data`'s item (adjusting `name` from possible alias to name and saving TPD formatted value in `value` property).

#### `tpd-label`

Labels the attributed element.

#### `tpd-input`/`tpd-output`

As tagnames, these ones are substituted by the HTML of correspondent options of TPD types.

## Predefinitions

Typrod proportions some built-in registrations:

### TPD types

Name | Alias(es) | Details
---- | --------- | -------
`'string'` | `'s'` and `'str'` | For single-line texts.
`'search'` | | Similar to text.
`'password'` | `'p'` and `'pw'` | Ones whose value is obscured. Outputs hiding chars too.
`'number'` | `'n'` and `'num'` | As normally.
`'range'` | `'r'` | Idem.
`'boolean'` | `'b'` and `'bool'` | Idem.
`'date'` | `'d'` | Idem.
`'time'` | `'t'` | Idem.
`'datetime'` | `'dt'` | Idem.
`'option'` | `'o'` and `'opt'` | Single `<select>`. You only must to transfer a string of scope's array (formed by objects with pairs `id`-`label`) to `tpd-data` in `options` key.
`'options'` | `'oo'` and `'opts'` | The same but multiple.
`'color'` | `'c'` | Handle hexadecimal color.
`'url'` | `'u'` | URL.
`'email'` | `'e'` and `'em'` | E-mail address.
`'tel'` | `'t'` | Telephone number.

### TPD components

#### Forms

You have namesake `'form'`. It rawly prints `<div>`s with `<label>` and input, and a submit button. You have to add the `ng-submit` directive by yourself and `data-name` attribute as namespace of labelable elements.

#### Tables

* `'table'`: shows a labeled head and record rows. Place attribute `data-expression` as we make on `tpd-values` but with an array.
* `'thead, tfoot'`: labels `<th>`s.
* `'tbody > tr'`: outputs `<td>`s.