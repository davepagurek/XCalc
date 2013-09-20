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

<h4>Parameters</h4>
A new graph is created using the following syntax:
```javascript
var graph = XCalc.graphExpression(expression, width, height, rangeX, rangeY);
```

`expression:String` The expression to be graphed. <strong>Required.</strong>

`width:Number` The width of the canvas. Default is 400.

`height:Number` The height of the canvas. Default is 400.

`rangeX:Number` The horizontal range of the graph, from x=-rangeX to x=rangeX. Default is 10.

`rangeY:Number` The vertical range of the graph, from y=-rangeX to y=rangeX. Default is auto fit.


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