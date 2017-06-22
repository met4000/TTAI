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
				var append = "<table id=\"disptable\"><tr><th colspan=\"7\"><input type=\"text\" id=\"name\" value=\"" + root.getAttribute("name") + "\" placeholder=\"Deck Name\"></th></tr><tr>";
				for (var s = 0; s < 7; s++)
					append += "<th>" + (!s ? "ID" : (!(s - 1) ? "Name" : ("<input type=\"text\" id=\"s" + (s - 1) + "\" value=\"" + root.getAttribute("s" + (s - 1)) + "\" placeholder=\"Stat " + (s - 1) + "\">"))) + "</th>";
				_("disp").innerHTML = append + "</tr></table>";
				
				var disp = _("disptable");
				var maxi = [[]], maxv = [];
				var ca = xml.getElementsByTagName("card");
				for (var x = 0; x < 5; x++) {
					maxv[x] = 0;
					maxi[x] = [];
				}
				for (var i = 0; i < ca.length; i++) {
					var append = "<tr>";
					for (var s = 0; s < 7; s++) {
						append += "<td>" + (!s ? i : ("<input type=\"text\" id=\"" + i + "" + (s - 1) + "\" placeholder=\"" + ca[i].getAttribute(!(s - 1) ? "name" : "s" + (s - 1)) + "\" onchange=\"updateXML()\">")) + "</td>";
						if (s > 1) {
							if (ca[i].getAttribute("s" + (s - 1)) > maxv[s - 2]) {
								maxi[s - 2] = [i];
								maxv[s - 2] = ca[i].getAttribute("s" + (s - 1));
							} else if (ca[i].getAttribute("s" + (s - 1)) == maxv[s - 2])
								maxi[s - 2].push(i);
						}
					}
					disp.innerHTML += append + "</tr>";
				}
				disp.innerHTML += "<tr><th colspan=\"7\">Deck Analysis</th></tr>";
				var append = "<tr>";
				for (var s = 0; s < 6; s++) {
					append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Highest" : (maxi[s - 1].join(", ") + " (" + maxv[s - 1] + ")")) + "</td>";
				}
				disp.innerHTML += append + "</tr>";
			} else {
				alert("Invalid file format: must be .ttxm");
				_("deckfile").value = "";
			}
		}
		reader.readAsText(file);
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
	for (var s = 0; s < 5; s++)
		deck.setAttribute("s" + (s + 1), _("s" + (s + 1)).itr());
	for (var c = 0; c < _("disptable").getElementsByTagName("tr").length - 4; c++) {
		var card = deck.appendChild(xml.createElement("card"));
		card.setAttribute("name", _(c + "0").itr());
		for (var s = 0; s < 5; s++)
			card.setAttribute("s" + (s + 1), _(c + "" + (s + 1)).itr());
	}
}

function downloadXML(){
	updateXML();
	
	var pom = document.getElementById("download");
	var bb = new Blob([new XMLSerializer().serializeToString(xml)], {type: "application/octet-stream"});
	pom.setAttribute("href", window.URL.createObjectURL(bb));
	pom.setAttribute("download", _("name").itr() + ".ttxm");
	pom.dataset.downloadurl = ["application/octet-stream", pom.download, pom.href].join(":");
}
