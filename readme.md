<h1>XCalc.js</h1>
Mathematical Expression Calculator by Dave Pagurek

<h2>Usage</h2>
Add the following to your head tag:
```HTML
<script src="js/XCalc.js"></script>
```

<h3>Expressions</h3>
Create an XCalc expression like this:
```javascript
var expression = XCalc.createExpression("(10^2/(2*50))-2(30x)");
```

To get the result of an expression:
```javascript
var x=2;
var result = expression.result(x);
```
If an x value is not specified, x defaults to zero.

<h3>Graphs</h3>
XCalc graphs are created like this:
```javascript
var graph = XCalc.graphExpression("x^2");
```

To add the graph canvas to the page:
```javascript
document.getElementById("result").appendChild(graph.getCanvas());
```

<h2>Operations Supported</h2>
As of version 1.6:
<ul>
	<li>Addition (x+y)</li>
	<li>Subtraction (x-y)</li>
	<li>Multiplication (x*y or (x)(y))</li>
	<li>Division (x/y)</li>
	<li>Exponents (x^y or x^(1/y) for roots)</li>
	<li>Single variable evaluation (include "x" in the expression string)</li>
</ul>