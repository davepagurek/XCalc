function simplifyText(event) {
  var input = document.getElementById("input").value;
  var variable = parseFloat(document.getElementById("variable").value);
  if (XCalc.properBrackets(input)) {
    document.getElementById("wrapper").className="";
    var timer = setTimeout(function() {
      var expression = XCalc.createExpression(input);
      document.getElementById("result").innerHTML = "<div class='final answer'>= " + expression.result(variable) + "</div>";
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