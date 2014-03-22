<h1>XCalc.js</h1>
Mathematical Expression Calculator by Dave Pagurek

<h2>Files</h2>
The XCalc release contains XCalc.js and XCalc.min.js. The minified script is smaller and fully functional for use. The uncompressed file is commented and to be used for editing and extending.

<h2>Usage</h2>
Add one of the following to your head tag to start using XCalc:
```HTML
<script src="XCalc.min.js"></script>
```
or
```HTML
<script src="XCalc.js"></script>
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

Expressions can be derived as well:
```javascript
var x=2;
var rateOfChange = expression.derive().result(x);
```

To get the formula of an expression as a string with HTML that can be formatted nicely (see the example CSS file):
```javascript
var formulaDiv = document.createElement("div");
formulaDiv.innerHTML = expression.prettyFormula();
document.getElementById("resultDiv").appendChild(formulaDiv);
```

To get the formula of an expression as a plaintext string:
```javascript
var formula = document.createElement("p");
formula.innerHTML = expression.formula();
document.getElementById("resultDiv").appendChild(formula);
```

To simplify the formula before getting it:
```javascript
var formula = document.createElement("p");
formula.innerHTML = expression.simplify().formula();
document.getElementById("resultDiv").appendChild(formula);
```

<h3>Graphs</h3>
XCalc graphs are created like this:

```javascript
var graph = XCalc.graphExpression("x^2");
```

To add the graph canvas to the page:
```javascript
document.getElementById("result").appendChild(graph.getCanvas());
```

<h4>Graph functions</h4>
<h5>Constructor</h5>
A new graph is created using the following syntax:
```javascript
var graph = XCalc.graphExpression(expression, width, height, x1, x2, y1, y2);
```

`expression:String` The expression to be graphed. <strong>Required.</strong>

`width:Number` The width of the canvas. Default is 400.

`height:Number` The height of the canvas. Default is 400.

`x1:Number` and `x2:Number` The horizontal range of the graph, where x1 &lt; <em>x</em> &lt; x2. Defaults to -10 and 10.

`y1:Number` and `y2:Number` The vertical range of the graph, where y1 &lt; <em>y</em> &lt; y2. Leave both empty or set to the string "auto" for auto range. Defaults to auto range.

<h5>Range</h5>
Set the range of the graph with:
```javascript
graph.setRange(x1, x2, y1, y2);
```
`x1:Number` and `x2:Number` The horizontal range of the graph, where x1 &lt; <em>x</em> &lt; x2. Defaults to -10 and 10.

`y1:Number` and `y2:Number` The vertical range of the graph, where y1 &lt; <em>y</em> &lt; y2. Leave both empty or set to the string "auto" for auto range. Defaults to auto range.

You can get the range of the graph with `graph.getX1()` or `graph.getY2()`, which allows you to increment the range of the graph by doing something like this:
```javascript
graph.setRange(graph.getX1()+5, graph.getX2()-5, graph.getY1()+5, graph.getY2()-5); //zooms in 5px on every side
```

<h3>Error checking</h3>
To check if XCalc ran into any errors (such as improperly nested brackets), use the following function:
```javascript
if (!XCalc.hasErrors()) {
	//Carry on as normal
} else {
	document.getElementById("errors").appendChild(XCalc.displayErrors());
	XCalc.clearErrors();
}
```

The `XCalc.displayErrors()` function returns a div with the class "error" with a `<ul>` of the errors.

Make sure to run `XCalc.clearErrors()` to reset `XCalc.hasErrors()`. Otherwise, errors from previous graphs will remain in the list.

<h2>Features</h2>
<h3>Graph Features</h3>
<ul>
	<li>Dynamic scale</li>
	<li>Auto-range (for y axis)</li>
	<li>Displays coordinates on hover</li>
	<li>Click and drag graph to pan</li>
	<li>Scroll on the graph to zoom in and out</li>
</ul>
<h3>Operations Supported</h3>
As of version 1.9:
<ul>
	<li>Addition (x+y)</li>
	<li>Subtraction (x-y)</li>
	<li>Multiplication (x*y or (x)(y))</li>
	<li>Division (x/y)</li>
	<li>Exponents (x^y or x^(1/y) for roots)</li>
	<li>The following functions:
		<ul>
			<li>sin</li>
			<li>cos</li>
			<li>tan</li>
			<li>asin</li>
			<li>acos</li>
			<li>atan</li>
			<li>abs</li>
			<li>log</li>
			<li>ln</li>
			<li>sqrt</li>
		</ul>
	</li>
	<li>Single variable evaluation (include "x" in the expression string)</li>
</ul>
<h3>Algebra and Calculus</h3>
<ul>
	<li>Create the derivative of an expression</li>
	<li>Simplify an expression</li>
</ul>