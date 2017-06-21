_ = function (s) { return document.getElementById(s); };

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
				var append = "<table id=\"disptable\"><tr><th colspan=\"7\">" + root.getAttribute("name") + "</th></tr><tr>";
				for (var s = 0; s < 7; s++)
					append += "<th>" + (!s ? "ID" : (!(s - 1) ? "Name" : root.getAttribute("s" + (s - 1)))) + "</th>";
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
						append += "<td>" + (!s ? i : ca[i].getAttribute(!(s - 1) ? "name" : "s" + (s - 1))) + "</td>";
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
	var xmlstring = _("disp").value;
	if (window.DOMParser) {
			parser = new DOMParser();
			xml = parser.parseFromString(xmlstring, "text/xml");
	} else {
			xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.async = false;
			xml.loadXML(xmlstring);
	}
	set = xml.getElementsByTagName("set")[0];
}

function downloadXML(){
	updateXML();
	
	var pom = document.getElementById("download");
	var bb = new Blob([new XMLSerializer().serializeToString(xml)], {type: "application/octet-stream"});
	pom.setAttribute("href", window.URL.createObjectURL(bb));
	pom.dataset.downloadurl = ["application/octet-stream", pom.download, pom.href].join(":");
}
