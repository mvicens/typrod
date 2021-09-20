# Typrod

Typrod (acronym of "type", "property" and "data"; and abbreviated as TPD) is an [AngularJS](https://angularjs.org) library to synthetize info handlings based on values conversions and input/output displays.

:warning: Important: Here are some words that may create confusion since also are elemental terms of JavaScript or AngularJS. Because of this, for avoid ambiguity, our own concepts will be explicitly designated (e.g. "TPD data").

## Overview

Imagine AngularJS runs and you need to list and edit some data collections shown in different `<table>`s. Usually, for each listing, the following occurs:

1. An array (normally from an HTTP request) is captured.
2. Looping through each record, its values (if necessary) must to be transformed by hand. For example (among others):
   * For datetimes, from string format to `Date` object.
   * Maybe booleans are rarely passed (hypothetical presumption) from the server with numbers (`0`/`1`). Then, it becomes originals (`true`/`false`).
   * And perhaps a list of options is served in an old system (another assumption) as string with IDs joined by commas. It turns into array.
3. On table head (`<thead>`), captions appear situated in columns.
4. Finally, the result are displayed, each property over one cell, inserting manually:
   * Inputs:
     * Datetimes: with `<input type="datetime-local">`.
     * Booleans: checkboxes.
     * Options: multiple `<select>`s.
   * Outputs:
     * Datetimes: typically through [`date`](https://docs.angularjs.org/api/ng/filter/date) filter.
     * Booleans: rendering e.g. symbols ("✓"/"✗") or answers ("Yes"/"No" or initialized "Y"/"N").
     * Options: listed `<ul>`.
5. Once ready, when user interacts, every edition requires the inverse conversion of every value to save the change.

As we can see, these steps are repeated continuously for each of the lists. Do you want to build a `<form>`? The same again, with some few modifications: captured values are optionals and would be an object, no loops, nor outputs, `<label>`s instead of `<th>`s...

Well, so, using Typrod, all of these involving processes can be only-one-time done or excessively reduced. Accordingly, the same would be achieved like this:
1. Firstly, some simple settings are defined by a [provider](https://docs.angularjs.org/guide/providers), transmitting:
   * For each TPD type (datetimes, booleans, options... whatever!):
     * A conversion function.
     * An HTML template of input.
     * Output's.
     * To come back to JSON, another converting.
   * About TPD components (in our case, tables and forms), indicating mainly HTML contents.
2. At last, in the HTML coding, empty tags are printed with some attribute [directives](https://docs.angularjs.org/guide/directive) that contains the captured values and a proper data (group of TPD properties that indicate TPD type, label, param name, etc.).

And voilà! It is already prepared and automated. For the next TPD component, you only need to do the 2nd step, anymore.

### Concepts

#### TPD types

Whatever you can think. No limits.

##### Aliases

To speed up settings, can be referenced by aliases.

#### TPD properties

These are each of instances of a certain TPD type that contains a TPD value.

##### TPD values

Handled in JSON conversions.

##### Containers

The internal HTML content of a TPD property.

#### TPD datas

Groupings of TPD properties.

#### TPD components

It is possible customize any tag with any classname(s), attribute(s)...

##### Contents

Full HTML included in TPD components.

## Install

### NPM

```sh
npm install typrod
```

Then add TPD as a dependency for your app:

```js
angular.module( 'myApp', [ require( 'typrod' ) ] );
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/typrod/typrod.js"></script>
```

```js
angular.module( 'myApp', [ 'tpd' ] );
```

## Usage

### API

#### Provider

It is named `$tpdProvider`, whose methods (that all return it, allowing chaining) are:

##### `type(name, opts)`

Registers a TPD type.

<table>
<tr><th>Param</th><th>Type</th><th>Details</th></tr>
<tr><td rowspan="2"><code>name</code></td><td>String</td><td>Name.</td></tr>
<tr><td>Array</td><td>Name followed by its alias(es).</td></tr>
<tr><td rowspan="3"><code>opts</code></td><td>Object</td><td>Options (see the concerning section).</td></tr>
<tr><td>Function</td><td>To overwrite (see below) existing TPD type:<ul><li>Starting from the original options (argument).</li><li>Returns new ones (obj.).</li></ul></td></tr>
<tr><td>Array</td><td>Copied TPD type (see below) and options (obj. or fn., like above).</td></tr>
</table>

###### Options

<table>
<tr><th>Key(s)</th><th>Type</th><th colspan="3">Details</th><th>Default</th></tr>
<tr><td rowspan="3"><code>fromJson</code>/<code>toJson</code></td><td>Function</td><td rowspan="3">TPD value conversion from/to JSON.</td><td colspan="2"><ul><li>Argument: TPD value to convert.</li><li>Return: converted one.</li></ul></td><td rowspan="3"><code>angular.identity</code> / caller of own <code>toJSON</code> method (if exists)</td></tr>
<tr><td>String</td><td>Name of <a href="https://docs.angularjs.org/guide/services">factory/service</a>.</td><td rowspan="2">A fn. like before is extracted.</td></tr>
<tr><td>Array</td><td>Fact./serv. in <a href="https://docs.angularjs.org/guide/di#inline-array-annotation">inline array annotation</a>.</td></tr>
<tr><td rowspan="6"><code>input</code></td><td rowspan="2">String</td><td rowspan="8">HTML template.</td><td colspan="2">Tagged <a href="https://api.jquery.com/Types/#htmlString">HTML string</a>. Because of ambiguity, with multiple tags, it is necessary insert attribute <code>tpd-target</code> to establish the main input element.</td><td rowspan="6">Current definition of <code>'string'</code> TPD type</td></tr>
<tr><td>Name of <a href="https://docs.angularjs.org/guide/services">fact./serv.</a></td><td rowspan="2">Fn. extraction.</td></tr>
<tr><td>Array</td><td>Fact./serv. in <a href="https://docs.angularjs.org/guide/di#inline-array-annotation">IAA</a>.</td></tr>
<tr><td rowspan="2">Object</td><td colspan="2"><a href="https://api.jquery.com/Types/#jQuery">JQuery element</a>.</td></tr>
<tr><td colspan="2">DOM elem.</td></tr>
<tr><td>Function</td><td colspan="2"><ul><li>Argument: directive's scope.</li><li>Return: elem. (obj. or str.).</li></ul></td></tr>
<tr><td rowspan="2"><code>output</code></td><td>String</td><td colspan="2">Any string (plain texts, tags, interpolations...).</td><td rowspan="2"><code>'{{$property.value}}'</code></td></tr>
<tr><td>Function</td><td colspan="2"><ul><li>Argument: the scope.</li><li>Return: a string.</li></ul></td></tr>
</table>

###### Overwriting and copying

If an already added TPD type is register again, it is overwritten. You must to pass either its name (not alias) or the reserved `'*'` value to apply globally on all.

Meanwhile, if there are definitions of a certain TPD type in TPD components' exceptional containers (explanation below), a new TPD type can inherit these ones by the copy mechanism.

##### `component(selector, content, [ec])`

Registers a TPD component.

<table>
<tr><th>Param</th><th>Type</th><th>Details</th></tr>
<tr><td><code>selector</code></td><td>String</td><td>CSS selector.</td></tr>
<tr><td rowspan="2"><code>content</code></td><td>String</td><td>HTML template.</td></tr>
<tr><td>Function</td><td><ul><li>Argument: selector's JQuery element.</li><li>Return: the HTML.</li></ul></td></tr>
<tr><td><code>ec</code> (optional)</td><td>Object</td><td>Exceptional containers (see below).</td></tr>
</table>

Overwriting (but basic one) is also allowed.

When Typrod activates, collects the coincidences and priors the TPD component of most [CSS specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) and oldest.

###### Exceptional containers

It may happen that, for a TPD component, a particular TPD type does not follow the same structure as the others. So, you can define this too.

In the provided object, its keys have to be TPD type names while values store exactly the same than `content` (2nd param).

#### Service

`$tpd()` proportinates a read-only object of original setters (without defaults) of registers. Regarding the TPD components, its function arguments are disposed in arrays. And the TPD type aliases appears too, grouped by names.

#### Directives

All of these should only be used in the HTML templates of TPD components, except the first one (whose utilitation is free).

##### `tpd-data`

Put this attribute over the selector HTML tag (TPD component) you want to locate the template. It contains an array where each object must to be formed as:

Key(s) | Type | Details
------ | ---- | -------
`type` (optional) | String | Name or alias of registered TPD type. Defaults to `'string'`.
`name` | String | Name of TPD property.
`label` | String | Translation ID of [Angular Translate](https://angular-translate.github.io).
`required` (optional) | Boolean | Input mandatority.
`min`/`max` (optional) | Any | Minimum/maximum of TPD value.

And other custom ones are permitted to a not-generic using.

##### `tpd-values`

In the same tag, determines the momentaneous TPD values, giving by `fromJSON` and receiving by `toJson`. It is optative.

##### `tpd-property`

Placed as attribute on containers, Typrod turns these into a repeatedly rendered element by `ng-repeat` that generates `$property` as local scope variable derived from each `tpd-data`'s item (altering `name` from possible alias to name and saving temporary TPD value in `value` property).

##### `tpd-label`

Labels the attributed element.

##### `tpd-input`/`tpd-output`

As tagnames, these ones are substituted by the HTML of correspondent options of TPD types.

### Predefinitions

Typrod proportions some built-in registrations:

#### TPD types

Name | Alias(es) | Details
---- | --------- | -------
`'string'` | `'s'` and `'str'` | For single-line texts.
`'password'` | `'p'` and `'pw'` | Ones whose value is obscured. Outputs hiding chars too.
`'number'` | `'n'` and `'num'` | As normally.
`'boolean'` | `'b'` and `'bool'` | Idem.
`'date'` | `'d'` | Idem.
`'time'` | `'t'` | Idem.
`'datetime'` | `'dt'` | Idem.
`'option'` | `'o'` and `'opt'` | Single `<select>`. You only must to transfer a string of scope's array (formed by objects with pairs `id`-`label`) to `tpd-data` in `options` key.
`'options'` | `'oo'` and `'opts'` | The same but multiple.

#### TPD components

##### Forms

You have namesake `'form'`. It prints simple `<div>`s with `<label>` and input, and a submit button. You have to add the `ng-submit` directive by yourself.

##### Tables

* `'table'`: shows a labeled head and record rows. Place attribute `data-expression` as we make on `tpd-values` but with an array.
* `'thead,tfoot'`: labels `<th>`s.
* `'tbody > tr'`: outputs `<td>`s.