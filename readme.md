<h1>XCalc.js</h1>
Mathematical Expression Calculator by Dave Pagurek

<h2>Usage</h2>
Add the following to your head tag:
```HTML
<script src="js/XCalc.js"></script>
```

Then, an XCalc expression can be created:
```javascript
var expression = XCalc.createExpression("(10^2/(2*50))-2(30x)");
```

To get the result of an expression:
```javascript
var x=2;
var result = expression.result(x);
```
If an x value is not specified, x defaults to zero.

<h2>Operations Supported</h2>
As of version 1.4:
<ul>
	<li>Addition (x+y)</li>
	<li>Subtraction (x-y)</li>
	<li>Multiplication (x*y or (x)(y))</li>
	<li>Division (x/y)</li>
	<li>Exponents (x^y or x^(1/y) for roots)</li>
	<li>Single variable evaluation (include "x" in the expression string)</li>
</ul>