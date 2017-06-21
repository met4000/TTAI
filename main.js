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
				
				_("disp").innerHTML = "<table id=\"disptable\"><tr><th colspan=\"4\">Cards</th></tr><tr><th>Name</th><th>Stat 1</th><th>Stat 2</th><th>Stat 3</th></tr></table>";
				var disp = _("disptable");
				for (var i = 0, ca = xml.getElementsByTagName("card"); i < ca.length; i++) {
					disp.innerHTML += "<tr><td>"
						+ ca[i].getAttribute("name") + "</td><td>"
						+ ca[i].getAttribute("s1") + "</td><td>"
						+ ca[i].getAttribute("s2") + "</td><td>"
						+ ca[i].getAttribute("s3") + "</td></tr>";
					for (var s = 0; s < 3; s++) {
						
					}
				}
				_("disp").innerHTML += "<span>Deck Analysis:<span></span><br>Highest:<br><ul><li>Stat 1: " + max[0] + " (" + maxv[0] + ")</li><li>Stat 2: " + max[1] + " (" + maxv[1] + ")</li><li>Stat 3: " + max[2] + " (" + maxv[2] + ")</li></ul>";
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
