//Module for input checking and parsing
var XCalc = (function() {

  //Class for operators
  function Operator(input) {
    this.operator = input;
    if (!input) {
      XCalc.log("Operator has no input.");
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

  //Class for special functions
  function MathFunction(input) {
    this.f=input;
    if (!input) {
      XCalc.log("Math function has no input.");
    }

    this.solve = function(segment) {
      var v = segment.coefficient;
      if (this.f=="sin") {
        return new Segment(Math.sin(v));
      } else if (this.f=="cos") {
        return new Segment(Math.cos(v));
      } else if (this.f=="tan") {
        return new Segment(Math.tan(v));
      } else if (this.f=="asin") {
        return new Segment(Math.asin(v));
      } else if (this.f=="acos") {
        return new Segment(Math.acos(v));
      } else if (this.f=="atan") {
        return new Segment(Math.atan(v));
      } else if (this.f=="abs") {
        return new Segment(Math.abs(v));
      } else if (this.f=="log") {
        return new Segment(Math.log(v)/Math.log(10));
      } else if (this.f=="ln") {
        return new Segment(Math.log(v));
      }
    };
  }

  //Class for constants
  function MathConstant(input) {
    this.c=input;
    if (!input) {
      XCalc.log("Math function has no input.");
    }

    this.solve = function() {
      if (this.c=="pi") {
        return new Segment(Math.PI);
      } else if (this.c=="e") {
        return new Segment(Math.E);
      }
    };
    
    this.prettyC = function() {
      if (this.c=="pi") {
        return "&pi;";
      } else if (this.c=="e") {
        return "e";
      }
    };
  }

  //Class for a segment of math (a container)
  function Segment(input) {
    this.sections = [];
    this.type="section";
    this.operator=0;
    this.coefficient=0;
    this.mathFunction=0;
    this.mathConstant=0;
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
      var operators="+-/*^";
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

            //If no brackets are open (and if the operator is actually - and not just a minus sign), break the loop.
            if ((openBrackets===0 && (operator!="-" || (i>0 && operators.indexOf(value.substr(i-1, 1))==-1) || i===0)) || (openBrackets==1 && operator=="(")) {
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

    var findLastTrig = function(trig, value) {
      var matches=0;
      var index=-1;
      var r=0;
      if (trig=="sin") {
        r=/(a)?sin/g;
      } else if (trig=="cos") {
        r=/(a)?cos/g;
      } else if (trig=="tan") {
        r=/(a)?tan/g;
      } else {
        return -1;
      }
      for (matches=r.exec(value); matches; matches=r.exec(value)) if (RegExp.$1 != "a") index=matches.index;
      var inBrackets=true;
      while (inBrackets && index!=-1) {
        var openBrackets=0;

        //Find how many brackets are opened or closed at a given point in the string
        for (var i=0; i<value.length; i++) {
          if (value.substr(i, 1)=="(") {
            openBrackets++;
          } else if (value.substr(i, 1)==")") {
            openBrackets--;
          }

          if (i==index) {

            //If no brackets are open (and if the operator is actually - and not just a minus sign), break the loop.
            if (openBrackets===0) {
              inBrackets=false;
              break;

            //Otherwise, find the next operator, and loop through again to see if that one is in brackets
            } else {
              var sub = value.substring(0, index);
              index=-1;
              for (matches=r.exec(sub); matches; matches=r.exec(sub)) if (RegExp.$1 != "a") index=matches.index;
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

    //Specifically for finding brackets that can be used for multiplication
    var findMultiplicationBrackets = function(value) {

      //Keep searching for the next last sign if the one found is within brackets
      var inBracketsOpen=true;
      var inBracketsClosed=true;
      var indexOpen=-1;
      var indexClosed=-1;
      var operators="+-/*^sincostanabsloglnsqrt";
      
      indexOpen=value.lastIndexOf("(");
      indexClosed=value.lastIndexOf(")");

      while (inBracketsOpen || inBracketsClosed) {
        var openBrackets=0;

        //Find how many brackets are opened or closed at a given point in the string
        for (var i=0; i<value.length; i++) {
          if (value.substr(i, 1)=="(") {
            openBrackets++;
          } else if (value.substr(i, 1)==")") {
            openBrackets--;
          }

          if (i==indexOpen && inBracketsOpen) {

            if (openBrackets==1 && i!==0 && operators.indexOf(value.substr(i-1, 1))==-1) {
              inBracketsOpen=false;

            //Otherwise, find the next operator, and loop through again to see if that one is in brackets
            } else {
              indexOpen = value.substring(0, indexOpen).lastIndexOf("(");
            }
          }

          if (i==indexClosed && inBracketsClosed) {

            if (openBrackets===0 && i<value.length-1 && operators.indexOf(value.substr(i+1, 1))==-1) {
              inBracketsClosed=false;

            //Otherwise, find the next operator, and loop through again to see if that one is in brackets
            } else {
              indexClosed = value.substring(0, indexClosed).lastIndexOf(")");
            }
          }
        }

        //If no more operators are found, break the loop
        if (indexOpen==-1) {
          inBracketsOpen=false;
        }
        if (indexClosed==-1) {
          inBracketsClosed=false;
        }
      }

      if (indexClosed>indexOpen && indexClosed!=-1) {
        return indexClosed;
      } else {
        return indexOpen;
      }
    };

    this.containsX = function() {
      if (this.type=="variable") {
        return true;
      } else if (this.type=="value") {
        return false;
      } else {
        if (this.sections.length==1) {
          return this.sections[0].containsX();
        } else if (this.sections.length==2) {
          return this.sections[0].containsX() || this.sections[1].containsX();
        }
      }
    };
    
    this.containsConstant = function() {
      if (this.type=="constant") {
        return true;
      } else if (this.type=="value") {
        return false;
      } else {
        if (this.sections.length==1) {
          return this.sections[0].containsConstant();
        } else if (this.sections.length==2) {
          return this.sections[0].containsConstant() || this.sections[1].containsConstant();
        }
      }
    };

    this.equals = function(expression) {
      if (this.type != expression.type) {
        return false;
      } else {
        if (this.type=="function") {
          return (this.mathFunction.f==expression.mathFunction.f && this.sections[0].equals(expression.sections[0]));
        } else if (this.type=="variable") {
          return (this.variable==expression.variable && this.coefficient==expression.coefficient);
        } else if (this.type=="constant") {
          return (this.mathConstant.c==expression.mathConstant.c);
        } else if (this.type=="value") {
          return this.coefficient==expression.coefficient;
        } else if (this.type=="section") {
          if (this.operator.operator=="*" || this.operator.operator=="+") {
            return (this.operator.operator==expression.operator.operator && ((this.sections[0].equals(expression.sections[0]) && this.sections[1].equals(expression.sections[1])) || (this.sections[0].equals(expression.sections[1]) && this.sections[1].equals(expression.sections[0]))));
          } else {
            return (this.operator.operator==expression.operator.operator && this.sections[0].equals(expression.sections[0]) && this.sections[1].equals(expression.sections[1]));
          }
        }
      }
    };

    //Recursively solve children
    this.solve = function(x) {
      if (!x) x=0;
      if (this.type=="value") {
        return this;
      } else if (this.type=="variable") {
        return new Segment(x);
      } else if (this.type=="constant") {
        return this.mathConstant.solve();
      } else if (this.type=="function") {
        return this.mathFunction.solve(this.sections[0].solve(x));
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

    this.simplify = function() {
      var expression = new Segment(this);
      var finalExpression;

      //If the segment is a variable, leave it as is.
      //If it contains a variable in its subsections, simplify subsections
      if (expression.containsX() && expression.type!="variable") {
        for (var i=0; i<expression.sections.length; i++) {
          expression.sections[i] = expression.sections[i].simplify();
        }
        if (expression.type=="section") {
          if (expression.operator.operator == "+") {
            if (expression.sections[0].type=="value" && expression.sections[0].coefficient===0) {
              expression=expression.sections[1];
            } else if (expression.sections[1].type=="value" && expression.sections[1].coefficient===0) {
              expression=expression.sections[0];
            }
          } else if (expression.operator.operator == "-") {
            if (expression.sections[1].type=="value" && expression.sections[1].coefficient===0) {
              expression=expression.sections[1];
            }
          } else if (expression.operator.operator == "*") {
            if (expression.sections[0].type=="value" && expression.sections[0].coefficient==1) {
              expression = new Segment(expression.sections[1]);
            } else if (expression.sections[1].type=="value" && expression.sections[1].coefficient==1) {
              expression = new Segment(expression.sections[0]);
            } else if ((expression.sections[0].type=="value" && expression.sections[0].coefficient===0) || (expression.sections[1].type=="value" && expression.sections[1].coefficient===0)) {
              expression = new Segment(0);
            } else if (expression.sections[1].type=="section" && expression.sections[1].operator.operator=="/" && expression.sections[1].sections[0].type=="value" && expression.sections[1].sections[0].coefficient==1) {
              expression.operator = new Operator("/");
              expression.sections[1]=expression.sections[1].sections[1];
            } else if (expression.sections[0].type=="section" && expression.sections[0].operator.operator=="/" && expression.sections[0].sections[0].type=="value" && expression.sections[0].sections[0].coefficient==1) {
              expression.operator = new Operator("/");
              var num = expression.sections[1];
              expression.sections[1] = expression.sections[0].sections[1];
              expression.sections[0] = num;
            } else if (expression.sections[0].type=="section" && expression.sections[0].operator.operator=="^" && expression.sections[1].type=="section" && expression.sections[1].operator.operator=="^" && expression.sections[0].sections[0].equals(expression.sections[1].sections[0])) {
              var exponent = new Segment(0);
              exponent.type="section";
              exponent.sections.push(expression.sections[0].sections[1]);
              exponent.sections.push(expression.sections[1].sections[1]);
              exponent.operator = new Operator("+");
              expression.sections[0]=expression.sections[0].sections[0];
              expression.sections[1]=exponent;
              expression.operator = new Operator("^");
            } else if (expression.sections[0].type=="section" && expression.sections[0].operator.operator=="*") {
              finalExpression = new Segment(0);
              finalExpression.operator = new Operator("*");
              finalExpression.type="section";
              if (!expression.sections[0].sections[1].containsX()) {
                if (expression.sections[0].sections[0].containsX()) {
                  finalExpression.sections.push(expression.sections[0].sections[0]);
                  finalExpression.sections.push(expression.sections[1]);
                  expression.sections[0]=expression.sections[0].sections[1];
                  expression.sections[1]=finalExpression;
                } else {
                  finalExpression.sections.push(expression.sections[0].sections[1]);
                  finalExpression.sections.push(expression.sections[1]);
                  expression.sections[0]=expression.sections[0].sections[0];
                  expression.sections[1]=finalExpression;
                }
              } else if (!expression.sections[0].sections[0].containsX()) {
                if (expression.sections[0].sections[1].containsX()) {
                  finalExpression.sections.push(expression.sections[0].sections[1]);
                  finalExpression.sections.push(expression.sections[1]);
                  expression.sections[0]=expression.sections[0].sections[0];
                  expression.sections[1]=finalExpression;
                } else {
                  finalExpression.sections.push(expression.sections[0].sections[0]);
                  finalExpression.sections.push(expression.sections[1]);
                  expression.sections[0]=expression.sections[0].sections[1];
                  expression.sections[1]=finalExpression;
                }
              }
            } else if (expression.sections[1].type=="section" && expression.sections[1].operator.operator=="*") {
              finalExpression = new Segment(0);
              finalExpression.operator = new Operator("*");
              finalExpression.type="section";
              if (!expression.sections[1].sections[1].containsX()) {
                if (expression.sections[1].sections[0].containsX()) {
                  finalExpression.sections.push(expression.sections[1].sections[0]);
                  finalExpression.sections.push(expression.sections[0]);
                  expression.sections[1]=expression.sections[1].sections[1];
                  expression.sections[0] = finalExpression;
                } else {
                  finalExpression.sections.push(expression.sections[1].sections[1]);
                  finalExpression.sections.push(expression.sections[0]);
                  expression.sections[1]=expression.sections[1].sections[0];
                  expression.sections[0] = finalExpression;
                }
              } else if (!expression.sections[1].sections[0].containsX()) {
                if (expression.sections[1].sections[1].containsX()) {
                  finalExpression.sections.push(expression.sections[1].sections[1]);
                  finalExpression.sections.push(expression.sections[0]);
                  expression.sections[1]=(expression.sections[1].sections[0]);
                  expression.sections[0] = finalExpression;
                } else {
                  finalExpression.sections.push(expression.sections[1].sections[0]);
                  finalExpression.sections.push(expression.sections[0]);
                  expression.sections[1]=(expression.sections[1].sections[1]);
                  expression.sections[0] = finalExpression;
                }
              }
            }
          } else if (expression.operator.operator == "/") {
            if (expression.sections[1].type=="value" && expression.sections[1].coefficient==1) {
              expression = expression.sections[0];
            } else if (expression.sections[0].equals(expression.sections[1])) {
              expression = new Segment(1);
            } else if (expression.sections[0].type=="section" && expression.sections[0].operator.operator=="^" && expression.sections[1].type=="section" && expression.sections[1].operator.operator=="^" && expression.sections[0].sections[0].equals(expression.sections[1].sections[0])) {
              var exponent2 = new Segment(0);
              exponent2.type="section";
              exponent2.sections.push(expression.sections[0].sections[1]);
              exponent2.sections.push(expression.sections[1].sections[1]);
              exponent2.operator = new Operator("-");
              expression.sections[0]=expression.sections[0].sections[0];
              expression.sections[1]=exponent2;
              expression.operator = new Operator("^");
            }
          } else if (expression.operator.operator == "^") {
            if (expression.sections[1].type=="value" && expression.sections[1].coefficient==1) {
              expression = expression.sections[0];
            } else if (expression.sections[1].type=="value" && expression.sections[1].coefficient===0) {
              expression = new Segment(0);
            } else if (expression.sections[0].type=="value" && expression.sections[0].coefficient==1) {
              expression = new Segment(1);
            } else if (expression.sections[0].type=="section" && (expression.sections[0].operator.operator=="/" || expression.sections[0].operator.operator=="/")) {
              var num2 = new Segment(0);
              num2.type="section";
              num2.operator = new Operator("^");
              num2.sections.push(expression.sections[0].sections[0]);
              num2.sections.push(expression.sections[1]);

              var denom = new Segment(0);
              denom.type="section";
              denom.operator = new Operator("^");
              denom.sections.push(expression.sections[0].sections[1]);
              denom.sections.push(expression.sections[1]);

              expression.operator = expression.sections[0].operator;
              expression.sections[0] = num2;
              expression.sections[1] = denom;
            }
          }
        }

      //If it can be simplified to a value, simplify
      } else if (expression.type!="variable" && (!expression.containsConstant() || expression.result()%1===0)) {
        expression.coefficient = expression.result();
        expression.type="value";
      }

      //Keep simplifying until it's the same
      if (this.equals(expression)) {
        return this;
      } else {
        return expression.simplify();
      }
    };

    this.derivative = function() {
      var expression = new Segment(this);
      var deriv = new Segment(0);
      var s1, s2, s3, s4;

      if (expression.type=="variable") {
        deriv.coefficient = 1;
      } else if (expression.type == "value" || expression.type=="constant" || !expression.containsX()) {
        deriv.coefficient = 0;
      } else if (expression.type=="section" && expression.operator.operator!="^") {

        //+/- rules
        if (expression.operator.operator == "+") {
          deriv.type = "section";
          deriv.sections.push(expression.sections[0].derivative());
          deriv.sections.push(expression.sections[1].derivative());
          deriv.operator = new Operator("+");
        } else if (expression.operator.operator == "-") {
          deriv.type = "section";
          deriv.sections.push(expression.sections[0].derivative());
          deriv.sections.push(expression.sections[1].derivative());
          deriv.operator = new Operator("-");

        //Product rule
        } else if (expression.operator.operator == "*") {
          s1 = new Segment(0);
          s1.type = "section";
          s1.sections.push(expression.sections[0].derivative());
          s1.sections.push(expression.sections[1]);
          s1.operator = new Operator("*");

          s2 = new Segment(0);
          s2.type = "section";
          s2.sections.push(expression.sections[0]);
          s2.sections.push(expression.sections[1].derivative());
          s2.operator = new Operator("*");

          deriv.type = "section";
          deriv.sections.push(s1);
          deriv.sections.push(s2);
          deriv.operator = new Operator("+");

        //Quotient rule
        } else if (expression.operator.operator == "/") {
          s1 = new Segment(0);
          s1.type = "section";
          s1.sections.push(expression.sections[0].derivative());
          s1.sections.push(expression.sections[1]);
          s1.operator = new Operator("*");

          s2 = new Segment(0);
          s2.type = "section";
          s2.sections.push(expression.sections[1].derivative());
          s2.sections.push(expression.sections[0]);
          s2.operator = new Operator("*");

          var num = new Segment(0);
          num.type = "section";
          num.sections.push(s1);
          num.sections.push(s2);
          num.operator = new Operator("-");

          var denom = new Segment(0);
          denom.type = "section";
          denom.sections.push(expression.sections[1]);
          denom.sections.push(new Segment(2));
          denom.operator = new Operator("^");

          deriv.type = "section";
          deriv.sections.push(num);
          deriv.sections.push(denom);
          deriv.operator = new Operator("/");
        }

      //functions
      } else {
        var uprime;

        s1 = new Segment(0);

        s1.type = "section";

        //Exponents
        if (expression.type == "section" && expression.operator.operator=="^") {

          //Implicitly derive ln(y)
          if (expression.sections[1].containsX() && expression.sections[0].containsX()) {
            s1 = expression;

            s2 = new Segment(0);
            s2.type = "function";
            s2.sections.push(expression.sections[0]);
            s2.mathFunction = new MathFunction("ln");

            s3 = new Segment(0);
            s3.type="section";
            s3.sections.push(expression.sections[1]);
            s3.sections.push(s2);
            s3.operator = new Operator("*");

            uprime = s3.derivative();

          //Power rule
          } else if (expression.sections[1].containsX()) {
            s2 = new Segment(0);
            s2.type = "function";
            s2.sections.push(expression.sections[0]);
            s2.mathFunction = new MathFunction("ln");

            s1.sections.push(expression);
            s1.sections.push(s2);
            s1.operator = new Operator("*");

            uprime = expression.sections[1].derivative();

          //Polynomial rule
          } else {
            var exp = new Segment(0);
            exp.type = "section";
            exp.sections.push(expression.sections[1]);
            exp.sections.push(new Segment(1));
            exp.operator = new Operator("-");

            s2 = new Segment(0);
            s2.type = "section";
            s2.sections.push(expression.sections[0]);
            s2.sections.push(exp);
            s2.operator = new Operator("^");

            s1.sections.push(expression.sections[1]);
            s1.sections.push(s2);
            s1.operator = new Operator("*");

            uprime = expression.sections[0].derivative();
          }
        } else {
          uprime = expression.sections[0].derivative();

          if (expression.mathFunction.f=="ln") {
            s1.sections.push(new Segment(1));
            s1.sections.push(expression.sections[0]);
            s1.operator = new Operator("/");

          } else if (expression.mathFunction.f=="log") {
            s2 = new Segment(0);
            s2.mathFunction = new MathFunction("ln");
            s2.type="function";
            s2.sections.push(new Segment(10));

            s3 = new Segment(0);
            s3.type="section";
            s3.sections.push(expression.sections[0]);
            s3.sections.push(s2);
            s3.operator = new Operator("*");

            s1.sections.push(new Segment(1));
            s1.sections.push(s3);
            s1.operator = new Operator("/");

          } else if (expression.mathFunction.f=="sin") {
            s1.mathFunction = new MathFunction("cos");
            s1.type="function";
            s1.sections.push(expression.sections[0]);

          } else if (expression.mathFunction.f=="cos") {
            s2 = new Segment(0);
            s2.mathFunction = new MathFunction("sin");
            s2.type="function";
            s2.sections.push(expression.sections[0]);

            s1.sections.push(new Segment(0));
            s1.sections.push(s2);
            s1.operator = new Operator("-");

          } else if (expression.mathFunction.f=="tan") {
            s2 = new Segment(0);
            s2.mathFunction = new MathFunction("cos");
            s2.type="function";
            s2.sections.push(expression.sections[0]);

            s3 = new Segment(0);
            s3.type="section";
            s3.sections.push(s2);
            s3.sections.push(new Segment(2));
            s3.operator = new Operator("^");

            s1.sections.push(new Segment(1));
            s1.sections.push(s3);
            s1.operator = new Operator("/");

          } else if (expression.mathFunction.f=="asin") {
            s2 = new Segment(0);
            s2.type="section";
            s2.sections.push(expression.sections[0]);
            s2.sections.push(new Segment(2));
            s2.operator=new Operator("^");

            s3 = new Segment(0);
            s3.type="section";
            s3.sections.push(new Segment(1));
            s3.sections.push(s2);
            s3.operator = new Operator("-");

            s4 = new Segment(0);
            s4.type="section";
            s4.sections.push(s3);
            s4.sections.push(new Segment(0.5));
            s4.operator = new Operator("^");

            s1.sections.push(new Segment(1));
            s1.sections.push(s4);
            s1.operator = new Operator("/");
          
          } else if (expression.mathFunction.f=="acos") {
            s2 = new Segment(0);
            s2.type="section";
            s2.sections.push(expression.sections[0]);
            s2.sections.push(new Segment(2));
            s2.operator=new Operator("^");

            s3 = new Segment(0);
            s3.type="section";
            s3.sections.push(new Segment(1));
            s3.sections.push(s2);
            s3.operator = new Operator("-");

            s4 = new Segment(0);
            s4.type="section";
            s4.sections.push(new Segment(0));
            s4.sections.push(new Segment(1));
            s4.operator = new Operator("-");

            var s5 = new Segment(0);
            s5.type="section";
            s5.sections.push(s3);
            s5.sections.push(new Segment(0.5));
            s5.operator = new Operator("^");

            s1.sections.push(s4);
            s1.sections.push(s5);
            s1.operator = new Operator("/");
          
          } else if (expression.mathFunction.f=="atan") {
            s2 = new Segment(0);
            s2.type="section";
            s2.sections.push(expression.sections[0]);
            s2.sections.push(new Segment(2));
            s2.operator=new Operator("^");

            s3 = new Segment(0);
            s3.type="section";
            s3.sections.push(s2);
            s3.sections.push(new Segment(1));
            s3.operator = new Operator("+");

            s1.sections.push(new Segment(1));
            s1.sections.push(s3);
            s1.operator = new Operator("/");
          
          }

        }

        //Chain rule
        deriv.type = "section";
        deriv.sections.push(s1);
        deriv.sections.push(uprime);
        deriv.operator = new Operator("*");
      }

      return deriv;
    };

    //Returns a string with the formula of the function
    this.formula = function() {
      var str = "";

      if (this.type=="value") {
        str += this.coefficient;
      } else if (this.type=="variable") {
        str += "x";
      } else if (this.type=="constant") {
        str += this.mathConstant.c;
      } else if (this.type=="function") {
        str += this.mathFunction.f + "(" + this.sections[0].formula() + ")";
      } else if (this.type=="section") {
        if (this.sections[0].type=="section") {
          str+= "(" + this.sections[0].formula() + ")";
        } else {
          str+= this.sections[0].formula();
        }
        str += this.operator.operator;
        if (this.sections[1].type=="section") {
          str+= "(" + this.sections[1].formula() + ")";
        } else {
          str+= this.sections[1].formula();
        }
      }

      return str;
    };

    this.derive = function() {
      return this.simplify().derivative().simplify();
    };

    //Returns formula in divs for CSS
    this.prettyFormula = function() {
      var str="<div class='group " + this.type + ((this.type=="section" && this.operator.operator=="/")?" division":"") + "'>";

      if (this.type=="value") {
        str += this.coefficient;
      } else if (this.type=="variable") {
        str += "x";
      } else if (this.type=="constant") {
        str += this.mathConstant.prettyC();
      } else if (this.type=="function") {
        str += this.mathFunction.f + "(" + this.sections[0].prettyFormula() + ")";
      } else if (this.type=="section") {
        if (this.sections[0].type=="section" && this.sections[0].operator.operator!="/") {
          str+= "(" + this.sections[0].prettyFormula() + ")";
        } else {
          str+= this.sections[0].prettyFormula();
        }
        if (this.operator.operator=="*") {
          str += "<span class='operator'>&times</span>";
        } else if (this.operator.operator!="^" && this.operator.operator!="/") {
          str += "<span class='operator'>" + this.operator.operator + "</span>";
        }
        if (this.operator.operator=="^") {
          str += "<div class='group exponent'>" + this.sections[1].prettyFormula() + "</div>";
        } else if (this.operator.operator == "/") {
          str += "<div class='group denom'>" + this.sections[1].prettyFormula() + "</div>";
        } else {
          if (this.sections[1].type=="section" && this.sections[0].operator.operator!="/") {
            str+= "(" + this.sections[1].prettyFormula() + ")";
          } else {
            str+= this.sections[1].prettyFormula();
          }
        }
      }
      str+="</div>";
      return str;
    };

    //constructor: parse the string
    if (input!==undefined) {
      if (typeof(input)=="string") {
        //Remove excess whitespace
        input = input.replace(/\s/g, "");

        //get rid of unnecessary brackets surrounding the section
        input = removeBrackets(input);
        
        //Find the last instance of each operator in the string
        var addition = findLast("+", input);
        var subtraction = findLast("-", input);
        var division = findLast("/", input);
        var exponent = findLast("^", input); //Find the first exponent, since those work in reverse
        var bracket1 = findLast("(", input);

        var sin = findLastTrig("sin", input);
        var cos = findLastTrig("cos", input);
        var tan = findLastTrig("tan", input);
        var asin = findLast("asin", input);
        var acos = findLast("acos", input);
        var atan = findLast("atan", input);
        var abs = findLast("abs", input);
        var log = findLast("log", input);
        var ln = findLast("ln", input);
        var sqrt = findLast("sqrt", input);
        var e = findLast("e", input);
        var pi = findLast("pi", input);
        var multiplication = findLast("*", input);
        var multiplication2 = findMultiplicationBrackets(input); //Find brackets that are the same as multiplication
        var xMultiplication = findLast("x", input);
        var xMultiplication2 = findLast("X", input);
        if (xMultiplication2>xMultiplication) xMultiplication = xMultiplication2;
        var functionMultiplication = -1;
        var operators="+-/*^sincostanabsloglnsqrt";
        if (sin>multiplication && (sin===0 || operators.indexOf(input.substr(sin-1, 1))==-1)) functionMultiplication=sin;
        if (cos>multiplication && (cos===0 || operators.indexOf(input.substr(cos-1, 1))==-1)) functionMultiplication=cos;
        if (tan>multiplication && (tan===0 || operators.indexOf(input.substr(tan-1, 1))==-1)) functionMultiplication=tan;
        if (asin>multiplication && (asin===0 || operators.indexOf(input.substr(asin-1, 1))==-1)) functionMultiplication=asin;
        if (acos>multiplication && (acos===0 || operators.indexOf(input.substr(acos-1, 1))==-1)) functionMultiplication=acos;
        if (atan>multiplication && (atan===0 || operators.indexOf(input.substr(atan-1, 1))==-1)) functionMultiplication=atan;
        if (abs>multiplication && (abs===0 || operators.indexOf(input.substr(abs-1, 1))==-1)) functionMultiplication=abs;
        if (log>multiplication && (log===0 || operators.indexOf(input.substr(log-1, 1))==-1)) functionMultiplication=log;
        if (ln>multiplication && (ln===0 || operators.indexOf(input.substr(ln-1, 1))==-1)) functionMultiplication=ln;
        if (sqrt>multiplication && (sqrt===0 || operators.indexOf(input.substr(sqrt-1, 1))==-1)) functionMultiplication=sqrt;
        if (xMultiplication>multiplication && (xMultiplication===0 || operators.indexOf(input.substr(xMultiplication-1, 1))==-1)) functionMultiplication=xMultiplication;
        if (e>multiplication && (e===0 || operators.indexOf(input.substr(e-1, 1))==-1)) functionMultiplication=e;
        if (pi>multiplication && (pi===0 || operators.indexOf(input.substr(pi-1, 1))==-1)) functionMultiplication=e;

        //Push back each half of the equation into a section, in reverse order of operations
        if (addition != -1 && addition>subtraction) {
          this.sections.push(new Segment(input.substring(0, addition)));
          this.sections.push(new Segment(input.substring(addition+1)));
          this.operator = new Operator("+");
        } else if (subtraction != -1) {
          if (subtraction>0) {
            this.sections.push(new Segment(input.substring(0, subtraction)));
          } else {
            this.sections.push(new Segment(0));
          }
          this.sections.push(new Segment(input.substring(subtraction+1)));
          this.operator = new Operator("-");
        } else if (functionMultiplication > 0 && Math.max(functionMultiplication, multiplication, multiplication2, division)==functionMultiplication) {
          this.sections.push(new Segment(input.substring(0, functionMultiplication)));
          this.sections.push(new Segment(input.substring(functionMultiplication)));
          this.operator = new Operator("*");
        } else if (multiplication2 != -1 && Math.max(multiplication2, multiplication, division)==multiplication2) {
          this.sections.push(new Segment(input.substring(0, multiplication2)));
          this.sections.push(new Segment(input.substring(multiplication2)));
          this.operator = new Operator("*");
        } else if (multiplication != -1 && multiplication>division) {
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
        } else if (sin != -1 && Math.max(sin, cos, tan, asin, acos, atan, abs, log, ln, sqrt)==sin) {
          this.sections.push(new Segment(input.substring(sin+3)));
          this.mathFunction = new MathFunction("sin");
          this.type = "function";
        } else if (cos != -1 && Math.max(cos, tan, asin, acos, atan, abs, log, ln, sqrt)==cos) {
          this.sections.push(new Segment(input.substring(cos+3)));
          this.mathFunction = new MathFunction("cos");
          this.type = "function";
        } else if (tan != -1 && Math.max(tan, asin, acos, atan, abs, log, ln, sqrt)==tan) {
          this.sections.push(new Segment(input.substring(tan+3)));
          this.mathFunction = new MathFunction("tan");
          this.type = "function";
        } else if (asin != -1 && Math.max(asin, acos, atan, abs, log, ln, sqrt)==asin) {
          this.sections.push(new Segment(input.substring(asin+4)));
          this.mathFunction = new MathFunction("asin");
          this.type = "function";
        } else if (acos != -1 && Math.max(acos, atan, abs, log, ln, sqrt)==acos) {
          this.sections.push(new Segment(input.substring(acos+4)));
          this.mathFunction = new MathFunction("acos");
          this.type = "function";
        } else if (atan != -1 && Math.max(atan, abs, log, ln, sqrt)==atan) {
          this.sections.push(new Segment(input.substring(atan+4)));
          this.mathFunction = new MathFunction("atan");
          this.type = "function";
        } else if (abs != -1 && Math.max(abs, log, ln, sqrt)==abs) {
          this.sections.push(new Segment(input.substring(abs+3)));
          this.mathFunction = new MathFunction("abs");
          this.type = "function";
        } else if (log != -1 && Math.max(log, ln, sqrt)==log) {
          this.sections.push(new Segment(input.substring(log+3)));
          this.mathFunction = new MathFunction("log");
          this.type = "function";
        } else if (ln != -1 && Math.max(ln, sqrt)==ln) {
          this.sections.push(new Segment(input.substring(ln+2)));
          this.mathFunction = new MathFunction("ln");
          this.type = "function";
        } else if (sqrt != -1) {
          this.sections.push(new Segment(input.substring(sqrt+4)));
          this.sections.push(new Segment("0.5"));
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
            XCalc.log("Brackets nesting error: " + input);
          }
          
        } else if (e != -1 && e>pi) {
          if (e>0) {
            this.sections.push(new Segment(input.substring(0, e)));
            this.sections.push(new Segment("e"));
            this.operator=new Operator("*");
          } else {
            this.mathConstant = new MathConstant("e");
            this.type="constant";
          }
        } else if (pi != -1) {
          if (pi>0) {
            this.sections.push(new Segment(input.substring(0, pi)));
            this.sections.push(new Segment("pi"));
            this.operator=new Operator("*");
          } else {
            this.mathConstant = new MathConstant("pi");
            this.type="constant";
          }

        //If there are no operators, just push the input itself
        } else {
          var xLocation=input.toLowerCase().indexOf("x");
          if (xLocation!=-1) {
            if (xLocation>0) {
              this.sections.push(new Segment(input.substring(0, xLocation)));
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
      } else if (input.simplify) {
        this.coefficient = input.coefficient;
        this.operator = input.operator;
        this.mathFunction = input.mathFunction;
        this.mathConstant = input.mathConstant;
        this.variable = input.variable;
        this.type=input.type;
        this.sections=[];
        for (var j=0; j<input.sections.length; j++) {
          this.sections.push(new Segment(input.sections[j]));
        }
      }
    } else {
      XCalc.log("Segment has no input.");
    }
  }


  //One point on a graph
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }


  //MathFunction to create graphs
  function Graph(value, width, height, startx1, startx2, starty1, starty2) {
    var autoRange=(starty1===undefined || starty1=="auto");

    //Properties
    if (typeof(value)=="string") {
      this.expression = new Segment(value);
    } else {
      this.expression = value;
    }
    var points = [];
    var canvas = document.createElement("canvas");
    canvas.width=width || 400;
    canvas.height=height || 400;
    var graphCanvas = document.createElement("canvas");
    graphCanvas.width = canvas.width;
    graphCanvas.height = canvas.height;
    var min;
    var max;
    var x1 = (startx1===undefined)?-10:startx1;
    var x2 = (startx2===undefined)?10:startx2;
    var y1 = (starty1===undefined)?-10:starty1;
    var y2 = (starty2===undefined)?10:starty2;
    var startMouse = new Point(0, 0);
    var mousePos = new Point(0, 0);
    var stage=0;
    var graphStage=0;
    var img=0;
    var timer=0;
    var distX=0;
    var distY=0;

    //Gets minimum y value in the set of points
    this.getMin = function(zeroes) {
      if (min===undefined) {
        var i=0;
        var _min;
        
        //Find minimum y value of points where the slope is approximately 0
        if (zeroes && zeroes.length>0) {
          while (i<zeroes.length && points[zeroes[i].x] === undefined) i++;
          if (i>=zeroes.length) {
            return 0;
          }
          _min = points[zeroes[i].x].y;
          for (++i; i<zeroes.length; i++) {
            if (points[zeroes[i].x] !== undefined && points[zeroes[i].x].y<_min) {
              _min = points[zeroes[i].x].y;
            }
          }
          min=_min;
          return min;
          
        //Otherwise, find the min of the given points normally
        } else if (points.length>0) {
          while (isNaN(points[i].y) || points[i].y === undefined || Math.abs(points[i].y) == Infinity) i++;
          _min = points[i].y;
          for (++i; i<points.length; i++) {
            if (!isNaN(points[i].y) && points[i].y !== undefined && Math.abs(points[i].y) != Infinity && points[i].y<_min) {
              _min = points[i].y;
            }
          }
          min=_min;
          return min;
        } else {
          return 0;
        }
      } else {
        return min;
      }
    };

    //Gets maximum y value in the set of points
    this.getMax = function(zeroes) {
      if (max===undefined) {
        var i=0;
        var _max;
        
        //Find maximum y value of points where the slope is approximately 0
        if (zeroes && zeroes.length>0) {
          while (i<=zeroes.length && points[zeroes[i].x] === undefined) i++;
          if (i>=zeroes.length) return 0;
          _max = points[zeroes[i].x].y;
          for (++i; i<zeroes.length; i++) {
            if (points[zeroes[i].x] !== undefined && points[zeroes[i].x].y>_max) {
              _max = points[zeroes[i].x].y;
            }
          }
          max=_max;
          return max;
          
        //Otherwise, find the max of the given points normally
        } else if (points.length>0) {
          while (isNaN(points[i].y) || points[i].y === undefined || Math.abs(points[i].y) == Infinity) i++;
          _max = points[i].y;
          for (++i; i<points.length; i++) {
            if (!isNaN(points[i].y) && points[i].y !== undefined && Math.abs(points[i].y) != Infinity && points[i].y>_max) {
              _max = points[i].y;
            }
          }
          max=_max;
          return max;
        } else {
          return 0;
        }
      } else {
        return max;
      }
    };
    
    //See if the distance between adjacent points is small enough to be graphable
    var checkCurvature = function(i) {
      return (points[i-1] && Math.pow((points[i].y-points[i-1].y)/(y2-y1)*canvas.height, 2) + Math.pow((points[i].x-points[i-1].x)/(points[points.length-1].x-points[0].x)*canvas.width, 2)<=3);
    }.bind(this);
    
    //Add points in between existing points
    var addDetail = function(i) {
      
      //Next to undefined points or next to points where the curvature is too big, add a point in between as long as the distance between the x values isn't too small
      while (Math.abs((points[i+1].x-points[i].x)/(points[points.length-1].x-points[0].x))*canvas.width>=0.03 && !((!(points[i].y===undefined || isNaN(points[i].y) || Math.abs(points[i].y) == Infinity) && !(points[i+1].y===undefined || isNaN(points[i+1].y) || Math.abs(points[i+1].y) == Infinity)) && (points[i].y>y2 || points[i].y<y1) && (points[i+1].y>y2 || points[i+1].y<y1)) && (((points[i].y===undefined || isNaN(points[i].y) || Math.abs(points[i].y) == Infinity) && !(points[i+1].y===undefined || isNaN(points[i+1].y) || Math.abs(points[i+1].y) == Infinity)) || !checkCurvature(i))) {
        var good=true;
        var newP = new Point((points[i].x+points[i+1].x)/2, this.expression.result((points[i].x+points[i+1].x)/2));
        if (newP.y!==undefined && Math.abs(newP.y)>10000) {
          newP.y=undefined;
          good=false;
        }
        points.splice(i+1, 0, newP);
        if (!good) break;
      }
    }.bind(this);

    //Updates the points and graph
    this.update = function() {
      var accuracy = (x2-x1)/canvas.width;
      points = [];
      for (var i=x1; i<=x2; i+=accuracy) {
        points.push(new Point(i, this.expression.result(i)));
        if (points[points.length-1].y!==undefined && Math.abs(points[points.length-1].y)>100000) {
          points[points.length-1].y=undefined;
        }
      }
      
      max=undefined;
      min=undefined;

      if (autoRange) {
        
        //Find approximate zeroes of the first derivative
        var zeroes = [];
        for (i=0; i<points.length-1; i++) {
          var slope = (points[i+1].y-points[i].y)/(points[i+1].x-points[i].x);
          if (slope !== undefined && Math.abs(slope)<10) {         
            zeroes.push(new Point(i, slope));
          }
        }
        
        if (this.getMax(zeroes)-this.getMin(zeroes)>100000) {
          y1=-100;
          y2=100;
        } else {
          y1=this.getMin(zeroes)-5;
          y2=this.getMax(zeroes)+5;
        }
        autoRange = false;
      }
      
      for (i=0; i<points.length-1; i++) {
        addDetail(i);
      }

      this.redraw();
    };

    var drawAxes = function(_x1, _x2, _y1, _y2) {
      stage.strokeStyle="#bdc3c7";
      stage.fillStyle="#bdc3c7";
      var limit=0;
      var i=0;

      //Draw the y axis if it is in the view
      if (0>=_x1-30 && 0<=_x2+30) {
        stage.lineWidth=2;
        stage.beginPath();
        stage.moveTo(canvas.width/2-(((_x2+_x1)/2)/(_x2-_x1))*canvas.width, 0);
        stage.lineTo(canvas.width/2-(((_x2+_x1)/2)/(_x2-_x1))*canvas.width, canvas.height);
        stage.closePath();
        stage.stroke();
        stage.textAlign = "right";
        stage.textBaseline="middle";

        //Draw ticks and numbers on x axis
        stage.lineWidth=1;
        limit = (Math.abs(_y2)>Math.abs(_y1))?Math.abs(_y2):Math.abs(_y1);
        for (i=0; i<=limit; i+=Math.pow(10, Math.floor(Math.log(_y2-_y1) / Math.LN10))/2) {
          if (i===0) continue;
          if (i<=_y2+50) {
            stage.beginPath();
            stage.moveTo(canvas.width/2-(((_x2+_x1)/2)/(_x2-_x1))*canvas.width-5, canvas.height-((i-_y1)/(_y2-_y1))*canvas.height);
            stage.lineTo(canvas.width/2-(((_x2+_x1)/2)/(_x2-_x1))*canvas.width+5, canvas.height-((i-_y1)/(_y2-_y1))*canvas.height);
            stage.closePath();
            stage.stroke();
            stage.fillText(""+(Math.round(i*100)/100), canvas.width/2-(((_x2+_x1)/2)/(_x2-_x1))*canvas.width-8, canvas.height-((i-_y1)/(_y2-_y1))*canvas.height);
          }

          if (i>=_y1-50) {
            stage.beginPath();
            stage.moveTo(canvas.width/2-(((_x2+_x1)/2)/(_x2-_x1))*canvas.width-5, canvas.height-((-i-_y1)/(_y2-_y1))*canvas.height);
            stage.lineTo(canvas.width/2-(((_x2+_x1)/2)/(_x2-_x1))*canvas.width+5, canvas.height-((-i-_y1)/(_y2-_y1))*canvas.height);
            stage.closePath();
            stage.stroke();
            stage.fillText(""+(Math.round(-i*100)/100), canvas.width/2-(((_x2+_x1)/2)/(_x2-_x1))*canvas.width-8, canvas.height-((-i-_y1)/(_y2-_y1))*canvas.height);
          }
        }
      }

      //Draw the x axis if it is in the view
      if (0>=_y1-50 && 0<=_y2+50) {
        stage.lineWidth=2;
        stage.beginPath();
        stage.moveTo(0, canvas.height/2+(((_y2+_y1)/2)/(_y2-_y1))*canvas.height);
        stage.lineTo(canvas.width, canvas.height/2+(((_y2+_y1)/2)/(_y2-_y1))*canvas.height);
        stage.closePath();
        stage.stroke();
        stage.textAlign = "center";
        stage.textBaseline="top";

        //Draw ticks and numbers on y axis
        stage.lineWidth=1;
        limit = (Math.abs(_x2)>Math.abs(_x1))?Math.abs(_x2):Math.abs(_x1);
        for (i=0; i<=limit; i+=Math.pow(10, Math.floor(Math.log(_x2-_x1) / Math.LN10))/2) {
          if (i===0) continue;
          if (i<=_x2+50) {
            stage.beginPath();
            stage.moveTo(((i-_x1)/(_x2-_x1))*canvas.width, canvas.height/2+(((_y2+_y1)/2)/(_y2-_y1))*canvas.height-5);
            stage.lineTo(((i-_x1)/(_x2-_x1))*canvas.width, canvas.height/2+(((_y2+_y1)/2)/(_y2-_y1))*canvas.height+5);
            stage.closePath();
            stage.stroke();
            stage.fillText(""+(Math.round(i*100)/100), ((i-_x1)/(_x2-_x1))*canvas.width, canvas.height/2+(((_y2+_y1)/2)/(_y2-_y1))*canvas.height+8);
          }

          if (i>=_x1-50) {
            stage.beginPath();
            stage.moveTo(((-i-_x1)/(_x2-_x1))*canvas.width, canvas.height/2+(((_y2+_y1)/2)/(_y2-_y1))*canvas.height-5);
            stage.lineTo(((-i-_x1)/(_x2-_x1))*canvas.width, canvas.height/2+(((_y2+_y1)/2)/(_y2-_y1))*canvas.height+5);
            stage.closePath();
            stage.stroke();
            stage.fillText(""+(Math.round(-i*100)/100), ((-i-_x1)/(_x2-_x1))*canvas.width, canvas.height/2+(((_y2+_y1)/2)/(_y2-_y1))*canvas.height+8);
          }
        }
      }
    }.bind(this);

    //Updates the canvas
    this.redraw = function() {
      if (points.length>1) {
        stage.fillStyle = "#FFFFFF";
        stage.fillRect(0, 0, canvas.width, canvas.height);
        graphStage.clearRect(0, 0, canvas.width, canvas.height);
        graphStage.lineCap="round";

        var offsetY = -y1;
        var offsetX = -points[0].x;

        drawAxes(x1, x2, y1, y2);

        //Draw all the points
        graphStage.strokeStyle="#2980b9";
        graphStage.lineWidth=1;
        graphStage.beginPath();

        //Find the first point that exists
        var i=0;
        while (isNaN(points[i].y) || points[i].y === undefined || Math.abs(points[i].y) == Infinity) i++;
        graphStage.moveTo(((points[i].x+offsetX)/(points[points.length-1].x-points[0].x))*canvas.width, canvas.height-((points[i].y+offsetY)/(y2-y1))*canvas.height);
        for (i++; i<points.length; i++) {
          
          //Only draw the line segment if the curvature is small enough
          if (checkCurvature(i-1) && points[i].y !== undefined && Math.abs(points[i].y) != Infinity && !isNaN(points[i].y)) {
            graphStage.lineTo(((points[i].x+offsetX)/(points[points.length-1].x-points[0].x))*canvas.width, canvas.height-((points[i].y+offsetY)/(y2-y1))*canvas.height);
          }
          
          //Move to the next point
          if ((points[i].y !== undefined && Math.abs(points[i].y) != Infinity && !isNaN(points[i].y))) {
            graphStage.moveTo(((points[i].x+offsetX)/(points[points.length-1].x-points[0].x))*canvas.width, canvas.height-((points[i].y+offsetY)/(y2-y1))*canvas.height);
          }
        }
        graphStage.closePath();
        graphStage.stroke();

        img = graphStage.getImageData(0, 0, canvas.width, canvas.height);
        stage.drawImage(graphCanvas, 0, 0);
      } else {
        XCalc.log("Not enough points to graph.");
      }
    };

    //Updates the view of the graph
    this.setRange = function(_x1, _x2, _y1, _y2) {
      x1=_x1;
      x2=_x2;
      y1=_y1;
      y2=_y2;
      if (_y1=="auto" || _y1===undefined) autoRange=true;
      this.update();
    };

    //Gets x and y of the mouse relative to the top left of the canvas
    var getMousePos = function(evt) {
        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;
        
        // return relative mouse position
        var mouseX = evt.clientX - rect.left - root.scrollLeft;
        var mouseY = evt.clientY - rect.top - root.scrollTop;
        
        return new Point(mouseX, mouseY);
    }.bind(this);

    //Starts panning
    var startDrag = function(event) {
      document.addEventListener("mousemove", dragMouse, false);
      document.addEventListener("mouseup", endDrag, false);
      document.documentElement.style["-moz-user-select"] = "none";
      document.documentElement.style["-webkit-user-select"] = "none";
      document.documentElement.style["-khtml-user-select"] = "none";
      document.documentElement.style["user-select"] = "none";
      canvas.removeEventListener("mouseover", startMouseOver, false);
      canvas.removeEventListener("mousemove", moveMouse, false);
      startMouse = getMousePos(event);
    }.bind(this);

    //Recalculate and redraws the view based on the mouse position
    var redrawLine = function() {
      var offsetX = ((mousePos.x-startMouse.x)/canvas.width)*(x2-x1);
      var offsetY = ((mousePos.y-startMouse.y)/canvas.height)*(y2-y1);
      this.setRange(x1-offsetX, x2-offsetX, y1+offsetY, y2+offsetY);
      startMouse = mousePos;
    }.bind(this);

    var dragMouse = function(event) {
      stage.fillStyle = "#FFFFFF";
      stage.fillRect(0, 0, canvas.width, canvas.height);
      mousePos = getMousePos(event);
      var newx1 = x1-((mousePos.x-startMouse.x)/canvas.width)*(x2-x1);
      var newx2 = x2-((mousePos.x-startMouse.x)/canvas.width)*(x2-x1);
      var newy1 = y1+((mousePos.y-startMouse.y)/canvas.height)*(y2-y1);
      var newy2 = y2+((mousePos.y-startMouse.y)/canvas.height)*(y2-y1);

      //If it's been dragged far enough, recalculate the line
      if (Math.abs(mousePos.x-startMouse.x)>canvas.width*0.8 || Math.abs(mousePos.y-startMouse.y)>canvas.height*0.8) {
        redrawLine();

      //Otherwise, move around the drawing we already have
      } else {
        drawAxes(newx1, newx2, newy1, newy2);
        stage.drawImage(graphCanvas, mousePos.x-startMouse.x, mousePos.y-startMouse.y);
      }

      if (event.preventDefault) event.preventDefault();
      return false;
      
    }.bind(this);

    //Stops dragging, resets listeners
    var endDrag = function(event) {
      document.removeEventListener("mousemove", dragMouse, false);
      document.removeEventListener("mouseup", endDrag, false);
      document.documentElement.style["-moz-user-select"] = "auto";
      document.documentElement.style["-webkit-user-select"] = "auto";
      document.documentElement.style["-khtml-user-select"] = "auto";
      document.documentElement.style["user-select"] = "auto";
      canvas.addEventListener("mouseover", startMouseOver, false);
      canvas.addEventListener("mousemove", moveMouse, false);
      mousePos = getMousePos(event);

      var offsetX = ((mousePos.x-startMouse.x)/canvas.width)*(x2-x1);
      var offsetY = ((mousePos.y-startMouse.y)/canvas.height)*(y2-y1);
      this.setRange(x1-offsetX, x2-offsetX, y1+offsetY, y2+offsetY);
    }.bind(this);

    var startMouseOver = function(event) {
      canvas.addEventListener("mousemove", moveMouse, false);
      canvas.addEventListener("mouseout", endMouseOver, false);
    }.bind(this);

    //Draws coordinates over point
    var moveMouse = function(event) {
      if (distX===0 && distY===0) {
        stage.fillStyle = "#FFFFFF";
        stage.fillRect(0, 0, canvas.width, canvas.height);
        drawAxes(x1, x2, y1, y2);
        stage.drawImage(graphCanvas, 0, 0);
        mousePos = getMousePos(event);
        if (mousePos.x<0) mousePos.x=0;
        if (mousePos.y<0) mousePos.y=0;
        var offsetY = -y1;

        //Check if the function exists at that x value
        var index=-1;
        var dist=-1;
        for (var i=0; i<points.length; i++) {
          if (dist==-1 || dist > Math.pow(((points[i].x-points[0].x)/(points[points.length-1].x-points[0].x))*canvas.width-mousePos.x, 2) + Math.pow(canvas.height-((points[i].y-y1)/(y2-y1))*canvas.height-mousePos.y, 2)) {
            index = i;
            dist = Math.pow(((points[i].x-points[0].x)/(points[points.length-1].x-points[0].x))*canvas.width-mousePos.x, 2) + Math.pow(canvas.height-((points[i].y-y1)/(y2-y1))*canvas.height-mousePos.y, 2);
          }
        }
        
        if (points[index].y===0 || points[index].y) {

          //Draw the coordinate
          stage.fillStyle="#2980b9";
          stage.beginPath();
          stage.arc(((points[index].x-points[0].x)/(points[points.length-1].x-points[0].x))*canvas.width, canvas.height-((points[index].y+offsetY)/(y2-y1))*canvas.height, 4, 0, 2*Math.PI);
          stage.closePath();
          stage.fill();
          stage.fillStyle="#000";
          stage.strokeStyle="#FFF";
          stage.lineWidth=4;
          stage.textBaseline="alphabetic";
          var txt="(" + (Math.round(points[index].x*100)/100).toFixed(2) + ", " + (Math.round(points[index].y*100)/100).toFixed(2) + ")";

          if (((points[index].x-points[0].x)/(points[points.length-1].x-points[0].x))*canvas.width<stage.measureText(txt).width/2+2) {
            stage.textAlign = "left";
          } else if (((points[index].x-points[0].x)/(points[points.length-1].x-points[0].x))*canvas.width>canvas.width-stage.measureText(txt).width/2-2) {
            stage.textAlign = "right";
          } else {
            stage.textAlign = "center";
          }
          stage.strokeText(txt, ((points[index].x-points[0].x)/(points[points.length-1].x-points[0].x))*canvas.width, -10+canvas.height-((points[index].y+offsetY)/(y2-y1))*canvas.height);
          stage.fillText(txt, ((points[index].x-points[0].x)/(points[points.length-1].x-points[0].x))*canvas.width, -10+canvas.height-((points[index].y+offsetY)/(y2-y1))*canvas.height);
        }
      }
    }.bind(this);

    var endMouseOver = function(event) {
      canvas.removeEventListener("mousemove", moveMouse, false);
      canvas.removeEventListener("mouseout", endMouseOver, false);
      stage.fillStyle = "#FFFFFF";
      stage.fillRect(0, 0, canvas.width, canvas.height);
      drawAxes(x1, x2, y1, y2);
      stage.drawImage(graphCanvas, 0, 0);
    }.bind(this);

    //Zooms based on scroll wheel
    var scrollZoom = function(event) {
      var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
      distX += delta*(x2-2*distX-x1)/25;
      distY += delta*(y2-2*distY-y1)/25;
      stage.fillStyle = "#FFFFFF";
      stage.fillRect(0, 0, canvas.width, canvas.height);
      drawAxes(x1 + distX, x2 - distX, y1 + distY, y2 - distY);
      stage.drawImage(graphCanvas, canvas.width*(1-((x2-x1)/(x2-2*distX-x1)))/2, canvas.height*(1-((y2-y1)/(y2-2*distY-y1)))/2, canvas.width*((x2-x1)/(x2-2*distX-x1)), canvas.height*((y2-y1)/(y2-2*distY-y1)));
      if (event.preventDefault) event.preventDefault();
      clearTimeout(timer);
      timer = setTimeout(updateZoom, 50);
      return false;
    }.bind(this);

    var updateZoom = function() {
      stage.fillStyle = "#FFFFFF";
      stage.fillRect(0, 0, canvas.width, canvas.height);
      this.setRange(x1 + distX, x2 - distX, y1 + distY, y2 - distY);
      distX=0;
      distY=0;
      clearTimeout(timer);
    }.bind(this);

    //Returns the canvas element
    this.getCanvas = function() {
      return canvas;
    };

    this.getX1 = function() {
      return x1;
    };

    this.getX2 = function() {
      return x2;
    };

    this.getY1 = function() {
      return y1;
    };

    this.getY2= function() {
      return y2;
    };

    //If canvas drawing is supported
    if (canvas.getContext) {

      //Get the canvas context to draw onto
      stage = canvas.getContext("2d");
      stage.font = "12px sans-serif";
      canvas.style.backgroundColor="#FFF";

      graphStage = graphCanvas.getContext("2d");

      //Make points
      this.update();

      canvas.addEventListener("mousedown", startDrag, false);
      canvas.addEventListener("mouseover", startMouseOver, false);
      canvas.addEventListener("mousewheel", scrollZoom, false);
      canvas.addEventListener("DOMMouseScroll", scrollZoom, false);
    } else {
      XCalc.log("Canvas not supported in this browser.");
      canvas = document.createElement("div");
      canvas.innerHTML="Canvas is not supported in this browser.";
    }
  }

  var worker={};

  worker.errors=[];

  //logs errors
  worker.log = function(message) {
    this.errors.push(message);
  };

  worker.clearErrors = function() {
    this.errors = [];
  };

  worker.hasErrors = function() {
    return this.errors.length;
  };

  //creates a list of errors to be displayed
  worker.displayErrors = function() {
    var errorDiv = document.createElement("div");
    errorDiv.className="error";
    errorDiv.innerHTML = "Errors:";
    var errorList = document.createElement("ul");
    for (var i=0; i<this.errors.length; i++) {
      var e = document.createElement("li");
      e.innerHTML = this.errors[i];
      errorList.appendChild(e);
    }
    errorDiv.appendChild(errorList);
    return errorDiv;
  };

  //Checks to see if brackets are properly nested in a string
  worker.properBrackets = function(value) {
    var openBrackets=0;
    for (var i=0; i<value.length; i++) {
      if (value.substr(i, 1)=="(") openBrackets++;
      if (value.substr(i, 1)==")") openBrackets--;
    }
    return openBrackets===0;
  };

  //Creates a new Segment for an expression
  worker.createExpression = function(value) {
    if (this.properBrackets(value)) {
      return new Segment(value);
    } else {
      this.log("Improperly nested brackets.");
      return 0;
    }
  };

  //Creates a new Graph for an expression
  worker.graphExpression = function(value, width, height, x1, x2, y1, y2) {
    if (this.properBrackets(value)) {
      return new Graph(value, width, height, x1, x2, y1, y2);
    } else {
      this.log("Improperly nested brackets.");
      return 0;
    }
  };

  return worker;
}());