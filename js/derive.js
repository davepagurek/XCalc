function simplifyText(event) {

  //Grabs data from input elements
  var input = document.getElementById("input").value;

  //Makes the results pane close
  document.getElementById("wrapper").className="";

  //wait for pane to close
  var timer = setTimeout(function() {
    document.getElementById("result").innerHTML = "";

    //Make graph
    var equation = XCalc.createExpression(input);

    //If there are no errors, show the graph
    if (!XCalc.hasErrors()) {
      document.getElementById("result").innerHTML = equation.simplify().derivative().simplify().formula();
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
  document.getElementById("derive").addEventListener("click", simplifyText);
  document.getElementById("input").addEventListener("keyup", onKeyUp);
  simplifyText();
};