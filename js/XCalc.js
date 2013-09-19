//Module for input checking and parsing
var XCalc = (function() {
  var worker={};

  //Checks to see if brackets are properly nested in a string
  worker.properBrackets = function(value) {
    var openBrackets=0;
    for (var i=0; i<value.length; i++) {
      if (value.substr(i, 1)=="(") openBrackets++;
      if (value.substr(i, 1)==")") openBrackets--;
    }
    return openBrackets===0;
  };

  //Creates a new Section for an expression
  worker.createExpression = function(value) {
    if (this.properBrackets(value)) {
      return new Segment(value);
    } else {
      return 0;
    }
  };

  return worker;
}());

//Class for 
function Operator(input) {
  this.operator = input;
  if (!input) {
    console.log("Operator has no input.");
  }

  this.solve = function(segment1, segment2, x) {
    var v1 = segment1.coefficient;
    if (segment1.type=="variable") {
      v1 = x;
    }
    var v2 = segment2.coefficient;
    if (segment2.type=="variable") {
      v2 = x;
    }
    if (this.operator=="+") {
      return new Segment(v1 + v2);
    } else if (this.operator=="-") {
      return  new Segment(v1 - v2);
    } else if  (this.operator=="*") {
      return  new Segment(v1 * v2);
    } else if (this.operator=="/") {
      return  new Segment(v1 / v2);
    } else if (this.operator=="^") {
      return  new Segment(Math.pow(v1, v2));
    }
  };
}

//Class for a segment of math (a container)
function Segment(input) {
  this.sections = [];
  this.type="section";
  this.operator=0;
  this.coefficient=0;
  this.variable="";

  var removeBrackets = function(value) {
    if (!value) return "";

    //While there are brackets around the string
    while (value.substr(0, 1)=="(" && value.substr(value.length-1, 1)==")") {
      var openBrackets=1;

      //See if the end bracket closes the opening bracket or not
      for (var i=1; i<value.length&&openBrackets>0; i++) {
        if (value.substr(i, 1)=="(") openBrackets++;
        if (value.substr(i, 1)==")") openBrackets--;
      }
      i-=1;

      //If it corresponds to different brackets, do nothing
      if (openBrackets!==0 || i!=value.length-1) {
        break;

      //Otherwise, remove the brackets, continue loop to see if there are more
      } else {
        value=value.substring(1, value.length-1);
      }
    }

    return value;
  };

  var findLast = function(operator, value) {

    //Keep searching for the next last sign if the one found is within brackets
    var inBrackets=true;
    var index=-1;
    if (operator!="^") {
      index=value.lastIndexOf(operator);
    } else {
      index=value.indexOf(operator); //Look for the first instead of last if it's an exponent
    }

    while (inBrackets) {
      var openBrackets=0;

      //Find how many brackets are opened or closed at a given point in the string
      for (var i=0; i<value.length; i++) {
        if (value.substr(i, 1)=="(") {
          openBrackets++;
        } else if (value.substr(i, 1)==")") {
          openBrackets--;
        }

        if (i==index) {

          //If no brackets are open, break the loop.
          if (openBrackets===0 || (openBrackets==1 && operator=="(")) {
            inBrackets=false;
            break;

          //Otherwise, find the next operator, and loop through again to see if that one is in brackets
          } else {
            if (operator!="^") {
              index = value.substring(0, index).lastIndexOf(operator);
            } else {
              var nextOperator = value.substring(index+1).indexOf(operator);
              if (nextOperator==-1) {
                index=-1;
              } else {
                index = (index+1+value.substring(index+1).indexOf(operator));
              }
            }
          }
        }
      }

      //If no more operators are found, break the loop
      if (index==-1) {
        inBrackets=false;
      }
    }
    return index;
  };

  //Recursively solve children
  this.solve = function(x) {
    if (!x) x=0;
    if (this.type=="value") {
      return this;
    } else if (this.type=="variable") {
      return new Segment(x);
    } else {
      if (this.sections.length==1) {
        return this.sections[0].solve(x);
      } else if (this.sections.length==2) {
        return this.operator.solve(this.sections[0].solve(x), this.sections[1].solve(x), x);
      }
    }
  };

  //Outputs the final answer
  this.result = function(x) {
    return this.solve(x).coefficient;
  };

  this.display = function(x) {
    if (this.type=="value") return this.coefficient;
    if (this.type=="variable") return x;
    var str = "<div class='group'>";
    for (var i=0; i<this.sections.length; i++) {
      str+=this.sections[i].display(x);
      if (i===0 && this.operator) {
        str+="<div class='group operator'>" + this.operator.operator + "</div>";
      }
    }
    str+="<div class='answer'>= " + this.solve().coefficient + "</div>";
    str+="</div>";
    return str;
  };



  //constructor
  if (input) {
    console.log(input);
    if (typeof(input)=="string") {
      //Remove excess whitespace
      input = input.replace(/\s/g, "");

      //get rid of unnecessary brackets surrounding the section
      input = removeBrackets(input);
      
      //Find the last instance of each operator in the string
      var addition = findLast("+", input);
      var subtraction = findLast("-", input);
      var multiplication = findLast("*", input);
      var division = findLast("/", input);
      var exponent = findLast("^", input); //Find the first exponent, since those work in reverse
      var bracket1 = findLast("(", input);

      //Push back each half of the equation into a section, in reverse order of operations
      if (addition != -1 && (subtraction == -1 || addition>subtraction)) {
        this.sections.push(new Segment(input.substring(0, addition)));
        this.sections.push(new Segment(input.substring(addition+1)));
        this.operator = new Operator("+");
      } else if (subtraction != -1) {
        this.sections.push(new Segment(input.substring(0, subtraction)));
        this.sections.push(new Segment(input.substring(subtraction+1)));
        this.operator = new Operator("-");
      } else if (multiplication != -1 && (division == -1 || multiplication>division)) {
        this.sections.push(new Segment(input.substring(0, multiplication)));
        this.sections.push(new Segment(input.substring(multiplication+1)));
        this.operator = new Operator("*");
      } else if (division != -1) {
        this.sections.push(new Segment(input.substring(0, division)));
        this.sections.push(new Segment(input.substring(division+1)));
        this.operator = new Operator("/");
      } else if (exponent != -1) {
        this.sections.push(new Segment(input.substring(0, exponent)));
        this.sections.push(new Segment(input.substring(exponent+1)));
        this.operator = new Operator("^");
      } else if (bracket1 != -1) {
        var openBrackets=1;
        for (var i=bracket1+1; i<input.length&&openBrackets>0; i++) {
          if (input.substr(i, 1)=="(") openBrackets++;
          if (input.substr(i, 1)==")") openBrackets--;
        }
        if (openBrackets===0) {
          var bracket2=i-1;
          if (bracket1>0) this.sections.push(new Segment(input.substring(0, bracket1)));
          if (bracket2-bracket1!=1) this.sections.push(new Segment(input.substring(bracket1+1, bracket2)));
          if (bracket2!=input.length-1) this.sections.push(new Segment(input.substring(bracket2+1)));
          this.operator = new Operator("*");
        } else {
          console.log("Brackets nesting error: " + input);
        }

      //If there are no operators, just push the input itself
      } else {
        var xLocation=input.indexOf("x");
        if (xLocation!=-1) {
          if (xLocation>0) {
            this.sections.push(new Segment(input.substring(0, xLocation)));
            console.log(input.substring(0, xLocation));
            this.sections.push(new Segment("x"));
            this.operator=new Operator("*");
          } else {
            this.variable="x";
            this.type="variable";
          }
        } else {
          this.coefficient = parseFloat(input);
          this.type = "value";
        }
      }
    } else if (typeof(input)=="number") {
      this.coefficient = input;
      this.type = "value";
    }
  } else {
    console.log("Segment has no input.");
  }
}