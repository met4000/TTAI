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
				append += "</tr></table><input id=\"new\" type=\"button\" onclick=\"addCard()\" value=\"Add Card\"><input id=\"rem\" type=\"text\" onchange=\"delCard(this.value)\" placeholder=\"Remove Card\"><br><br><table id=\"searchtable\"><tr><th colspan=\"8\"><input type=\"text\" id=\"cardsel\" placeholder=\"Card Analysis\" onchange=\"analyseCard(this.value)\"></th></tr><tr><th>ID</th><th>Name</th>";
				for (var s = 1; s < 7; s++)
					append += "<th>" + xml.getElementsByTagName("deck")[0].getAttribute("s" + s) + "</th>";
				_("disp").innerHTML = append + "</tr></table>";
				
				var disp = _("disptable");
				var c = xml.getElementsByTagName("card");
				for (var i = 0; i < c.length; i++) {
					var append = "<tr>";
					for (var s = 0; s < 8; s++) {
						append += "<td>" + (!s ? i : ("<input type=\"text\" id=\"" + i + "" + (s - 1) + "\" placeholder=\"" + c[i].getAttribute(!(s - 1) ? "name" : "s" + (s - 1)) + "\" onchange=\"updateXML();analyseDeck()\">")) + "</td>";
					}
					disp.innerHTML += append + "</tr>";
				}
				
				analyseDeckNR();
				_("cardsel").value = xml.getElementsByTagName("card")[0].getAttribute("name");
				analyseCard(_("cardsel").value);
			} else {
				alert("Invalid file format: must be .ttxm");
				_("deckfile").value = "";
			}
		}
		reader.readAsText(file);
}

function analyseDeck () {
	var disp = _("disptable");
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	
	analyseDeckNR();
}

function analyseDeckNR () {
	var disp = _("disptable");
	var maxi = [[]], maxv = [], mini = [[]], minv = [], varr = [[]];
	for (var x = 0; x < 6; x++) {
		maxv[x] = 0;
		maxi[x] = [];
		minv[x] = Infinity;
		mini[x] = [];
		varr[x] = [];
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
			if (!!s) {
				varr[s - 1][i] = parseInt(c[i].getAttribute("s" + s));
				if (parseInt(c[i].getAttribute("s" + s)) > maxv[s - 1] && parseInt(c[i].getAttribute("s" + s)) > -1) {
					maxi[s - 1] = [i];
					maxv[s - 1] = c[i].getAttribute("s" + s);
				} else if (c[i].getAttribute("s" + s) == maxv[s - 1])
					maxi[s - 1].push(i);
				else if (parseInt(c[i].getAttribute("s" + s)) < minv[s - 1] && parseInt(c[i].getAttribute("s" + s)) > -1) {
					mini[s - 1] = [i];
					minv[s - 1] = c[i].getAttribute("s" + s);
				} else if (c[i].getAttribute("s" + s) == minv[s - 1])
					mini[s - 1].push(i);
			}
		}
	}
	disp.innerHTML += "<tr><th colspan=\"8\">Deck Analysis</th></tr>";
	
	//Max
	var append = "<tr>";
	for (var s = 0; s < 7; s++) {
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Max" : (maxi[s - 1].join(", ") + " (" + maxv[s - 1] + ")")) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	//Min
	var append = "<tr>";
	for (var s = 0; s < 7; s++) {
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Min" : (mini[s - 1].join(", ") + " (" + minv[s - 1] + ")")) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	//Avg
	var append = "<tr>";
	window.rt = [];
	for (var s = 0; s < 7; s++) {
		if (!!s) {
			rt[s - 1] = 0;
			for (var i = 0; i < varr[s - 1].length; i++)
				rt[s - 1] += varr[s - 1][i];
			rt[s - 1] = Math.round(rt[s - 1] / varr[s - 1].length);
		}
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Mean" : rt[s - 1]) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	//Mode
	var append = "<tr>";
	window.m = [];
	for (var s = 0; s < 7; s++) {
		if (!!s) {
			var count = [];
			for (var i = 0; i < varr[s - 1].length; i++)
				count[i] = 0;
			for (var i = 0; i < varr[s - 1].length; i++)
				count[varr[s - 1][i]]++;
			m[s - 1] = count.length - 1;
			for (var i = count.length - 2; i >= 0; i--) {
				if (count[i] >= count[m[s - 1]])
					m[s - 1] = i;
			}
		}
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Mode" : m[s - 1]) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	//Med.
	var append = "<tr>";
	window.mc = [];
	for (var s = 0; s < 7; s++) {
		if (!!s) {
			varr[s - 1].sort(function (a, b) { return a - b; });
			var half = Math.floor(varr[s - 1].length / 2);
			mc[s - 1] = varr[s - 1].length % 2 ? varr[s - 1][half] : (Math.round(varr[s - 1][half - 1] + varr[s - 1][half]) / 2);
		}
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Median" : mc[s - 1]) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
}

function updateXML () {
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
	for (var c = 0; c < _("disptable").getElementsByTagName("tr").length - 8; c++) {
		var card = deck.appendChild(xml.createElement("card"));
		card.setAttribute("name", _(c + "0").itr());
		for (var s = 0; s < 6; s++)
			card.setAttribute("s" + (s + 1), _(c + "" + (s + 1)).itr());
	}
}

function downloadXML () {
	updateXML();
	
	var pom = document.getElementById("download");
	var bb = new Blob([new XMLSerializer().serializeToString(xml)], {type: "application/octet-stream"});
	pom.setAttribute("href", window.URL.createObjectURL(bb));
	pom.setAttribute("download", _("name").itr() + ".ttxm");
	pom.dataset.downloadurl = ["application/octet-stream", pom.download, pom.href].join(":");
}

function addCard () {
	var disp = _("disptable");
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
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

function delCard (index) {
	_("rem").value = "";
	if (index == "")
		return;
	
	var disp = _("disptable");
	disp.removeChild(disp.getElementsByTagName("tbody")[parseInt(index) + 1]);
	for (var i = parseInt(index) + 1; i < disp.getElementsByTagName("tbody").length - 6; i++) {
		disp.getElementsByTagName("tbody")[i].getElementsByTagName("td")[0].innerHTML = i - 1;
		for (var s = 0; s < 7; s++)
			_(i + "" + s).setAttribute("id", (i - 1) + "" + s);
	}
	
	updateXML();
	analyseDeck();
}

function analyseCard (name) {
	var caiTemp = _("cai") ? _("cai").value : "H";
	
	var c = xml.getElementsByName(name)[0];
	var disp = _("searchtable");
	if (c == undefined) {
		for (var s = 0; s < 8; s++)
			_("c" + s).innerHTML = "-";
			while (disp.getElementsByTagName("tbody").length > 2)
				disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
		return;
	}
	while (disp.getElementsByTagName("tbody").length > 1)
		disp.removeChild(disp.getElementsByTagName("tbody")[disp.getElementsByTagName("tbody").length - 1]);
	var append = "<tr>";
	for (var s = 0; s < 8; s++)
		append += "<td id=\"c" + s + "\">" + (!s ? [].indexOf.call(c.parentNode.children, c) : c.getAttribute(s > 1 ? "s" + (s - 1) : "name")) + "</td>";
	disp.innerHTML += append + "</tr>";
	
	var append = "<tr>";
	for (var s = 0; s < 7; s++) {
		var rc = 0;
		if (!!s)
			for (var i = 0; i < xml.getElementsByTagName("card").length; i++)
				if (parseInt(xml.getElementsByTagName("card")[i].getAttribute("s" + s)) > parseInt(c.getAttribute("s" + s)))
					rc++;
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Rank (n)" : rankify(rc + 1)) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	var append = "<tr>";
	window.gp = [];
	for (var s = 0; s < 7; s++) {
		var rc = 0;
		if (!!s) {
			for (var i = 0; i < xml.getElementsByTagName("card").length; i++)
				if (parseInt(xml.getElementsByTagName("card")[i].getAttribute("s" + s)) > parseInt(c.getAttribute("s" + s)))
					rc++;
			gp[s - 1] = 1 - Math.round((rc + 1) / xml.getElementsByTagName("card").length * 1000) / 1000;
		}
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Higher than (%)" : 100 - Math.round((rc + 1) / xml.getElementsByTagName("card").length * 100) + "%") + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	var append = "<tr>";
	for (var s = 0; s < 7; s++) {
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "s/a (.3)" : Math.round(c.getAttribute("s" + s) / rt[s - 1] * 1000) / 1000) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	var append = "<tr>";
	window.rp = [];
	for (var s = 0; s < 7; s++) {
		if (!!s)
			rp[s - 1] = Math.round(Math.round(c.getAttribute("s" + s) / rt[s - 1] * 100) * gp[s - 1]) / 100;
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "(RP) Hs/a (.2)" : rp[s - 1]) + "</td>";
	}
	append += "<td>" + (Math.round(rp.reduce(function (a, b) { return a + b; }, 0) / rp.length * 100) / 100) + "</td>";
	disp.innerHTML += append + "</tr>";
	
	var append = "<tr>";
	for (var s = 0; s < 7; s++) {
		append += "<td" + (!s ? " colspan=\"2\"" : "") + " id=\"ca" + s + "\">" + (!s ? "<input id=\"cai\" onchange=\"cardCustom()\" placeholder=\"Custom Stat\"> (.2)" : "") + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	var append = "<tr>";
	for (var s = 0; s < 7; s++) {
		var rc = 0;
		if (!!s)
			for (var i = 0; i < 6; i++)
				if (rp[i] > rp[s - 1])
					rc++;
		append += "<td" + (!s ? " colspan=\"2\"" : "") + ">" + (!s ? "Recomended (n)" : rankify(rc + 1)) + "</td>";
	}
	disp.innerHTML += append + "</tr>";
	
	_("cardsel").value = name;
	_("cai").value = caiTemp;
	cardCustom();
}

function rankify (val) {
	var suffix = "th";
	if (val % 10 == 1)
		suffix = "st";
	else if (val % 10 == 2)
		suffix = "nd";
	else if (val % 10 == 3)
		suffix = "rd";
	return val + suffix;
}

function cardCustom () {
	var c = _("cai").value.replace(/ /g, "");
	var cd = c[0];
	if (c == "")
		return;
	for (var i = 1; i < c.length; i++)
		cd += "*" + c[i];
	cd = cd.replace(/\*\*/g, "*");
	
	var sArr = ["/", "+", "-", ".", "(", ")"];
	for (var i = 0; i < sArr.length; i++) {
		cd = cd.replace(RegExp(("*" + sArr[i]).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "g"), sArr[i]);
		cd = cd.replace(RegExp((sArr[i] + "*").replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "g"), sArr[i]);
	}
	
	cd = cd.replace(/H/g, "gp[i-1]");
	cd = cd.replace(/a/g, "rt[i-1]");
	cd = cd.replace(/m/g, "m[i-1]");
	cd = cd.replace(/c/g, "mc[i-1]");
	//cd = cd.replace(/]g/g, "]*g").replace(/]r/g, "]*r").replace(/]m/g, "]*m");
	for (var s = 1; s < 7; s++) {
		try {
			_("ca" + s).innerHTML = Math.round(eval(cd.replace(/i/g, s).replace(/s/g, "xml.getElementsByName(_(\"cardsel\").value)[0].getAttribute(\"s\" + " + s + ")").replace(/]x/g, "]*x")) * 100) / 100;
//			if (s == 1)
//				console.log(cd.replace(/i/g, s).replace(/s/g, "xml.getElementsByName(_(\"cardsel\").value)[0].getAttribute(\"s\" + " + s + ")").replace(/]x/g, "]*x"));
		} catch (err) {
			_("ca" + s).innerHTML = "-";
			if (s == 1)
				console.log(err.toString());
		}
	}
}
