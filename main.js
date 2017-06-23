_ = function (s) { return document.getElementById(s); };
Element.prototype.itr = function () { return this.value === "" ? this.placeholder : this.value }

window.onload = function () {
	_("deckfile").addEventListener("change", printFile, false);
};

var fileName = false;
var xml = false;
var set = false;

function printFile (evt) {
		var files = evt.target.files;
		var file = files[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			fileName = _("deckfile").value.split("\\")[_("deckfile").value.split("\\").length - 1];
			var extension = fileName.split(".")[fileName.split(".").length - 1].toLowerCase();
			if (extension == "ttxm") {
				if (window.DOMParser) {
						parser = new DOMParser();
						xml = parser.parseFromString(event.target.result, "text/xml");
				} else {
						xml = new ActiveXObject("Microsoft.XMLDOM");
						xml.async = false;
						xml.loadXML(event.target.result);
				}
				
				var root = xml.getElementsByTagName("deck")[0];
				var append = "<table id=\"disptable\"><tr><th colspan=\"8\"><input type=\"text\" id=\"name\" value=\"" + root.getAttribute("name") + "\" placeholder=\"Deck Name\"></th></tr><tr>";
				for (var s = 0; s < 8; s++)
					append += "<th>" + (!s ? "ID" : (!(s - 1) ? "Name" : ("<input type=\"text\" id=\"s" + (s - 1) + "\" value=\"" + root.getAttribute("s" + (s - 1)) + "\" placeholder=\"Stat " + (s - 1) + "\">"))) + "</th>";
				_("disp").innerHTML = append + "</tr></table>";
				
				var disp = _("disptable");
				var maxi = [[]], maxv = [];
				var c = xml.getElementsByTagName("card");
				for (var x = 0; x < 6; x++) {
					maxv[x] = 0;
					maxi[x] = [];
				}
				for (var i = 0; i < c.length; i++) {
					var append = "<tr>";
					for (var s = 0; s < 8; s++) {
						append += "<td>" + (!s ? i : ("<input type=\"text\" id=\"" + i + "" + (s - 1) + "\" placeholder=\"" + c[i].getAttribute(!(s - 1) ? "name" : "s" + (s - 1)) + "\" onchange=\"updateXML();analyseDeck()\">")) + "</td>";
						if (s > 1) {
							if (c[i].getAttribute("s" + (s - 1)) > maxv[s - 2]) {
								maxi[s - 2] = [i];
								maxv[s - 2] = c[i].getAttribute("s" + (s - 1));
							} else if (c[i].getAttribute("s" + (s - 1)) == maxv[s - 2])
								maxi[s - 2].push(i);
						}
					}
					disp.innerHTML += append + "</tr>";
				}
				disp.innerHTML += "<tr><th colspan=\"8\">Deck Analysis</th></tr>";
				var append = "<tr>";
				for (var s = 0; s < 7; s++)
					append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Highest" : (maxi[s - 1].join(", ") + " (" + maxv[s - 1] + ")")) + "</td>";
				disp.innerHTML += append + "</tr>";
				
				disp = _("disp");
				disp.innerHTML += "<input id=\"new\" type=\"button\" onclick=\"addCard()\" value=\"Add Card\">";
				disp.innerHTML += "<input id=\"rem\" type=\"text\" onchange=\"delCard(this.value)\" placeholder=\"Remove Card\">";
			} else {
				alert("Invalid file format: must be .ttxm");
				_("deckfile").value = "";
			}
		}
		reader.readAsText(file);
}

function analyseDeck() {
	var disp = _("disptable");
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	
	analyseDeckNR();
}

function analyseDeckNR() {
	var disp = _("disptable");
	var maxi = [[]], maxv = [];
	for (var x = 0; x < 6; x++) {
		maxv[x] = 0;
		maxi[x] = [];
	}
	var c = xml.getElementsByTagName("card");
	
	for (var s = 1; s < 7; s++) {
		if (_("s" + s).value !== "")
			_("s" + s).setAttribute("value", _("s" + s).value);
	}
	
	for (var i = 0; i < c.length; i++) {
		for (var s = 0; s < 7; s++) {
			if (_(i + "" + s).value !== "")
				_(i + "" + s).setAttribute("value", _(i + "" + s).value);
			if (_(i + "" + s).value === "" && _(i + "" + s).hasAttribute("value"))
				_(i + "" + s).removeAttribute("value");
			if (s > 1) {
				if (c[i].getAttribute("s" + (s - 1)) > maxv[s - 2] && parseInt(c[i].getAttribute("s" + (s - 1))) > -1) {
					maxi[s - 2] = [i];
					maxv[s - 2] = c[i].getAttribute("s" + (s - 1));
				} else if (c[i].getAttribute("s" + (s - 1)) == maxv[s - 2])
					maxi[s - 2].push(i);
			}
		}
	}
	disp.innerHTML += "<tr><th colspan=\"8\">Deck Analysis</th></tr>";
	var append = "<tr>";
	for (var s = 0; s < 7; s++) {
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Highest" : (maxi[s - 1].join(", ") + " (" + maxv[s - 1] + ")")) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
}

function updateXML() {
	var xmlstring = "<?xml version=\"1.0\"?><deck></deck>";
	if (window.DOMParser) {
			parser = new DOMParser();
			xml = parser.parseFromString(xmlstring, "text/xml");
	} else {
			xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.async = false;
			xml.loadXML(xmlstring);
	}
	var deck = xml.getElementsByTagName("deck")[0];
	deck.setAttribute("name", _("name").itr());
	for (var s = 0; s < 6; s++)
		deck.setAttribute("s" + (s + 1), _("s" + (s + 1)).itr());
	for (var c = 0; c < _("disptable").getElementsByTagName("tr").length - 4; c++) {
		var card = deck.appendChild(xml.createElement("card"));
		card.setAttribute("name", _(c + "0").itr());
		for (var s = 0; s < 6; s++)
			card.setAttribute("s" + (s + 1), _(c + "" + (s + 1)).itr());
	}
}

function downloadXML() {
	updateXML();
	
	var pom = document.getElementById("download");
	var bb = new Blob([new XMLSerializer().serializeToString(xml)], {type: "application/octet-stream"});
	pom.setAttribute("href", window.URL.createObjectURL(bb));
	pom.setAttribute("download", _("name").itr() + ".ttxm");
	pom.dataset.downloadurl = ["application/octet-stream", pom.download, pom.href].join(":");
}

function addCard() {
	var disp = _("disptable");
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	var append = "<tr>";
	var i = disp.getElementsByTagName("tbody").length - 1;
	for (var s = 0; s < 8; s++)
		append += "<td>" + (!s ? i : ("<input type=\"text\" id=\"" + i + "" + (s - 1) + "\" placeholder=\"" + (!(s - 1) ? "name" : "s" + (s - 1)) + "\" onchange=\"updateXML();analyseDeck()\">")) + "</td>";
	disp.innerHTML += append + "</tr>";
	
	updateXML();
	analyseDeckNR();
}

function delCard(index) {
	if (index === "")
		return;
	_("rem").value = "";
	
	var disp = _("disptable");
	disp.removeChild(disp.getElementsByTagName("tbody")[parseInt(index) + 1]);
	for (var i = parseInt(index) + 1; i < disp.getElementsByTagName("tbody").length - 2; i++) {
		disp.getElementsByTagName("tbody")[i].getElementsByTagName("td")[0].innerHTML = i - 1;
		for (var s = 0; s < 7; s++)
			_(i + "" + s).setAttribute("id", (i - 1) + "" + s);
	}
	
	updateXML();
	analyseDeck();
}
