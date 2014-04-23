function simplifyText(event) {

  //Grabs data from input elements
  var input = document.getElementById("input").value;
  var x1 = (document.getElementById("x1").value==="")?undefined:parseFloat(document.getElementById("x1").value);
  var x2 = (document.getElementById("x2").value==="")?undefined:parseFloat(document.getElementById("x2").value);
  var y1 = document.getElementById("y1").value?(document.getElementById("y1").value.trim()=="auto")?"auto":parseFloat(document.getElementById("y1").value):undefined;
  var y2 = document.getElementById("y2").value?(document.getElementById("y2").value.trim()=="auto")?"auto":parseFloat(document.getElementById("y2").value):undefined;

  var derive = false;
  if (input.lastIndexOf("derive")!=-1) {
    derive=true;
    input = input.substring(input.lastIndexOf("derive")+6);
  } else if (input.lastIndexOf("derivative of")!=-1) {
    derive=true;
    input = input.substring(input.lastIndexOf("derivative of")+13);
  } else if (input.lastIndexOf("derivative")!=-1) {
    derive=true;
    input = input.substring(input.lastIndexOf("derivative")+10);
  } else if (input.lastIndexOf("dy/dx")!=-1) {
    derive=true;
    input = input.substring(input.lastIndexOf("dy/dx")+5);
  } else if (input.lastIndexOf("d/dx")!=-1) {
    derive=true;
    input = input.substring(input.lastIndexOf("d/dx")+4);
  }

  //Makes the results pane close
  document.getElementById("wrapper").className="";

  //wait for pane to close
  var timer = setTimeout(function() {
    var width=500;
    if (document.getElementById("wrapper").offsetWidth<550) width = document.getElementById("wrapper").offsetWidth - 50;

    document.getElementById("result").innerHTML = "";

    var inputFunction = XCalc.createExpression(input);
    var graph;
    var derivative;
    var derivativeGraph;

    //If there are no errors, show the graph
    if (!XCalc.hasErrors()) {
      if (derive) {
        derivative = inputFunction.derive();
        derivativeGraph = XCalc.graphExpression(derivative, width, Math.round(width*0.6), x1, x2, y1, y2);
        graph = XCalc.graphExpression(inputFunction, width, Math.round(width*0.6), x1, x2, y1, y2);
      } else {
        graph = XCalc.graphExpression(inputFunction, width, Math.round(width*0.8), x1, x2, y1, y2);
      }
      
      if (derive) {
        var derivativeFormula = document.createElement("div");
        derivativeFormula.className = "formula";
        derivativeFormula.innerHTML = "y' = " + derivative.prettyFormula();
        document.getElementById("result").appendChild(derivativeFormula);
        document.getElementById("result").appendChild(derivativeGraph.getCanvas());
      }
      var inputFormula = document.createElement("div");
      inputFormula.className = "formula";
      inputFormula.innerHTML = "y = " + inputFunction.simplify().prettyFormula();
      document.getElementById("result").appendChild(inputFormula);
      document.getElementById("result").appendChild(graph.getCanvas());
      document.getElementById("wrapper").className="open";

    //Otherwise, show the errors, then clear the error list
    } else {
      document.getElementById("result").appendChild(XCalc.displayErrors());
      document.getElementById("wrapper").className="open";
      XCalc.clearErrors();
    }
  }, 800);
}

function onKeyUp(event) {
  if (event.keyCode==13) {
    simplifyText();
  }
}

window.onload = function() {
  document.getElementById("graph").addEventListener("click", simplifyText);
  document.getElementById("input").addEventListener("keyup", onKeyUp);
  simplifyText();
};