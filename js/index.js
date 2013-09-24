function simplifyText(event) {

  //Grabs data from input elements
  var input = document.getElementById("input").value;
  var x1 = parseFloat(document.getElementById("x1").value);
  var x2 = parseFloat(document.getElementById("x2").value);
  var y1 = document.getElementById("y1").value?(document.getElementById("y1").value.trim()=="auto")?"auto":parseFloat(document.getElementById("y1").value):undefined;
  var y2 = document.getElementById("y2").value?(document.getElementById("y2").value.trim()=="auto")?"auto":parseFloat(document.getElementById("y2").value):undefined;

  //Makes the results pane close
  document.getElementById("wrapper").className="";

  //wait for pane to close
  var timer = setTimeout(function() {
    document.getElementById("result").innerHTML = "";

    //Make graph
    var graph = XCalc.graphExpression(input, 500, 500, x1, x2, y1, y2);

    //If there are no errors, show the graph
    if (!XCalc.hasErrors()) {
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