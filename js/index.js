//Module for input checking and parsing
var Worker = (function() {
  var w={};

  //Divides input up into Sections and Singles
  w.parse = function(value) {
    if (!value) return 0;
    
    var sections = [];
    
    //Remove excess whitespace
    value.replace(/\s/g, '');

    //get rid of unnecessary brackets surrounding the section
    while (value.substr(0, 1)=="(" && value.substr(value.length-1, 1)==")") {
      var openBrackets=1;
      for (var i=1; i<value.length&&openBrackets>0; i++) {
        if (value.substr(i, 1)=="(") openBrackets++;
        if (value.substr(i, 1)==")") openBrackets--;
      }
      i-=1;
      if (openBrackets!=0 || i!=value.length-1) {
        break;
      } else {
        value=value.substring(1, value.length-1);
      }
    }
    
    var addition = value.lastIndexOf("+");
    var subtraction = value.lastIndexOf("-");
    var multiplication = value.lastIndexOf("*");
    var division = value.lastIndexOf("/");
    var exponent = value.indexOf("^");
    var bracket1 = value.lastIndexOf("(");

    /* make sure we pick out operators that AREN'T IN BRACKETS
    by checking if the signs are in brackets and searching
    again if they are */
    var redos=[0, 0, 0, 0, 0, 0];
    if (addition==-1) redos[0]=1;
    if (subtraction==-1) redos[1]=1;
    if (multiplication==-1) redos[2]=1;
    if (division==-1) redos[3]=1;
    if (exponent==-1) redos[4]=1;
    if (bracket1==-1) redos[5]=1;
    while (redos[0]==0 || redos[1]==0 || redos[2]==0 || redos[3]==0 || redos[4]==0 || redos[5]==0) {
      var openBrackets=0;
      for (var i=0; i<value.length; i++) {
        if (value.substr(i, 1)=="(") {
          if (i==bracket1) {
            if (openBrackets>0) {
              bracket1 = value.substring(0, bracket1).lastIndexOf("(");
            } else {
              redos[5]=1;
            }
          }
          openBrackets++;
        } else if (value.substr(i, 1)==")") {
          openBrackets--;
        } else if (i==addition) {
          if (openBrackets>0) {
            addition = value.substring(0, addition).lastIndexOf("+");
          } else {
            redos[0]=1;
          }
        } else if (i==subtraction) {
          if (openBrackets>0) {
            subtraction = value.substring(0, subtraction).lastIndexOf("-");
          } else {
            redos[1]=1;
          }
        } else if (i==multiplication) {
          if (openBrackets>0) {
            multiplication = value.substring(0, multiplication).lastIndexOf("*");
          } else {
            redos[2]=1;
          }
        } else if (i==division) {
          if (openBrackets>0) {
            division = value.substring(0, division).lastIndexOf("/");
          } else {
            redos[3]=1;
          }
        } else if (i==exponent) {
          if (openBrackets>0) {
            var nextExponent = value.substring(exponent+1).indexOf("^");
            if (nextExponent==-1) {
              exponent=-1;
            } else {
              exponent = (exponent+1+value.substring(exponent+1).indexOf("^"));
            }
          } else {
            redos[4]=1;
          }
        }
      }

      if (addition==-1) redos[0]=1;
      if (subtraction==-1) redos[1]=1;
      if (multiplication==-1) redos[2]=1;
      if (division==-1) redos[3]=1;
      if (exponent==-1) redos[4]=1;
      if (bracket1==-1) redos[5]=1;
    }

    console.log(value);

    //reverse BEDMAS
    if (addition != -1 && (subtraction == -1 || addition>subtraction)) {
      sections.push(new Segment(value.substring(0, addition)));
      sections.push(new Single(value.substring(addition, addition+1), "operator"));
      sections.push(new Segment(value.substring(addition+1)));
    } else if (subtraction != -1) {
      sections.push(new Segment(value.substring(0, subtraction)));
      sections.push(new Single(value.substring(subtraction, subtraction+1), "operator"));
      sections.push(new Segment(value.substring(subtraction+1)));
    } else if (multiplication != -1 && (division == -1 || multiplication>division)) {
      sections.push(new Segment(value.substring(0, multiplication)));
      sections.push(new Single(value.substring(multiplication, multiplication+1), "operator"));
      sections.push(new Segment(value.substring(multiplication+1)));
    } else if (division != -1) {
      sections.push(new Segment(value.substring(0, division)));
      sections.push(new Single(value.substring(division, division+1), "operator"));
      sections.push(new Segment(value.substring(division+1)));
    } else if (exponent != -1) {
      sections.push(new Segment(value.substring(0, exponent)));
      sections.push(new Single(value.substring(exponent, exponent+1), "operator"));
      sections.push(new Segment(value.substring(exponent+1)));
    } else if (bracket1 != -1) {
      var openBrackets=1;
      for (var i=bracket1+1; i<value.length&&openBrackets>0; i++) {
        if (value.substr(i, 1)=="(") openBrackets++;
        if (value.substr(i, 1)==")") openBrackets--;
      }
      if (openBrackets==0) {
        var bracket2=i-1;
        if (bracket1>0) sections.push(new Segment(value.substring(0, bracket1)));
        if (bracket2-bracket1!=1) sections.push(new Segment(value.substring(bracket1+1, bracket2)));
        if (bracket2!=value.length-1) sections.push(new Segment(value.substring(bracket2+1)));
      } else {
        console.log("Brackets nesting error: " + value);
        return 0;
      }
    } else {
      sections.push(new Single(value, "value"));
    }
    
    return sections;
  };

  //Checks to see if brackets are properly nested in a string
  w.properBrackets = function(value) {
    var openBrackets=0;
    for (var i=0; i<value.length; i++) {
      if (value.substr(i, 1)=="(") openBrackets++;
      if (value.substr(i, 1)==")") openBrackets--;
    }
    return openBrackets==0;
  };

  return w;
}());

//Class for a single number or operator
function Single(value, type) {
  this.value = value;
  this.type = type;
  this.solve = function() {
    if (this.type == "value") {
      return parseFloat(this.value);
    } else {
      return 0;
    }
  };
  this.display = function() {
    return this.value;
  };
  this.pretty = function() {
    var str="<div class='group " + this.type + "' val='" + this.value + "'>";
    if (this.value!="/" && this.value!="^" && this.value!="*") {
      str+= this.value;
    }
    if (this.value=="*") {
      str += "&times";
    }
    str+="</div>";
    return str;
  }
}

//Class for a segment of math (a container)
function Segment(value) {
  this.sections = value?Worker.parse(value):[];
  this.type = "section";
  
  //Recursively solve children
  this.solve = function() {
    var i=0;
    var value=0;
    while (i<this.sections.length) {
      if (i+1>=this.sections.length) {
        value = this.sections[i].solve();
        i++;
      } else if (this.sections[i+1].type=="operator") {
        if (this.sections[i+1].value == "+") {
          value += this.sections[i].solve() + this.sections[i+2].solve();
        } else if (this.sections[i+1].value == "-") {
          value += this.sections[i].solve() - this.sections[i+2].solve();
        } else if (this.sections[i+1].value == "*") {
          value += this.sections[i].solve() * this.sections[i+2].solve();
        } else if (this.sections[i+1].value == "/") {
          value += this.sections[i].solve() / this.sections[i+2].solve();
        } else if (this.sections[i+1].value == "^") {
          value += Math.pow(this.sections[i].solve(), this.sections[i+2].solve());
        }
        i+=3;
      } else {
        value += this.sections[i].solve() * this.sections[i+1].solve();
        i+=2;
      }
    }
    return value;
  };
  
  //Display grouped blocks
  this.display = function() {
    var str="";
    for (var i=0; i<this.sections.length; i++) {
      str+="<div class='box'>" + this.sections[i].display();
      if (this.sections[i].type=="section") str+= "<div class='answer'>= " + this.sections[i].solve() + "</div>";
      str+="</div>";
    }
    return str;
  };
  
  this.pretty = function(css) {
    var str="<div class='group " + this.type;
    if (css) str+= " " + css;
    str+= "' val='" + this.value + "'>";
    for (var i=0; i<this.sections.length; i++) {
      if ((i+1<this.sections.length && this.sections[i+1].type!="operator")||(i-1>=0 && this.sections[i-1].type!="operator")) {
        str+=this.sections[i].pretty("brackets");
      } else {
        str+=this.sections[i].pretty();
      }
    }
    str+="</div>";
    return str;
  };
}


function simplifyText(event) {
  var input = document.getElementById("input").value;
  if (Worker.properBrackets(input)) {
    document.getElementById("wrapper").className="";
    var timer = setTimeout(function() {
      var expression = new Segment(input);
      document.getElementById("result").innerHTML = expression.pretty("middle") + "<div class='display'>" + expression.display() + "</div><div class='final answer'>= " + expression.solve() + "</div>";
      var matches = document.querySelectorAll("[val='/']");
      var i;
      for (i=0; i<matches.length; i++) {
        matches[i].previousSibling.style.verticalAlign = "bottom";
      }
      matches = document.querySelectorAll("[val='^']");
      for (i=0; i<matches.length; i++) {
        matches[i].previousSibling.style.verticalAlign = "middle";
        if (matches[i].previousSibling.childNodes.length>1) {
          matches[i].previousSibling.classList.add("brackets");
        }
      }
      document.getElementById("wrapper").className="solved";
    }, 800);
  } else {
    document.getElementById("result").innerHTML = "<div class='error'>Error: Improperly nested brackets. Remember to only use round brackets and close all opened brackets.</div>";
  }
}

window.onload = function() {
  document.getElementById("simplify").addEventListener("click", simplifyText);
  simplifyText();
};