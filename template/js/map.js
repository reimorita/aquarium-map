var geocoder;
var map;

/**
 * マップ＆ピンの表示
 */
function init() {
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(36.204824, 138.252924);
	var mapOptions = {
		zoom : 6,
		center : latlng,
		mapTypeId : google.maps.MapTypeId.HYBRID
	}
	map = new google.maps.Map(document.getElementById('map'), mapOptions);
	showPins();
}

/**
 * 水族館のインポート処理
 */
function importGPS() {
	var name = document.getElementById('name').value;
	var names = name.split(",");
	for (var i = 0; i < names.length; i++) {
		getGeoInfo(names[i]);
	}
}

/**
 * ジオコーディング
 */
function getGeoInfo(name) {
	geocoder.geocode({
		'address' : name
	}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var location = String(results[0].geometry.location);
			var gps = location.substring(1,
					location.length - 1);
			var latlng = gps.split(',');
			var address = results[0].formatted_address.split(',')[1];

			save('name=' + name + '&lat=' + latlng[0] + '&lng='
					+ latlng[1] + '&address=' + address);

		} else {
			console.error('Geocode was not successful for the following reason: '
					+ status);
			alert('「' + name + '」という名の水族館は存在しません。');
		}
	});
}

/**
 * GPS保存
 */
function save(param) {
	var xmlhttp = createHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			setTimeout("showPins()", 500);
		}
	}
	xmlhttp.open('POST', '/save', true);
	xmlhttp.setRequestHeader("Content-Type",
			"application/x-www-form-urlencoded");
	xmlhttp.send(param);
}

/**
 * GPSリスト取得
 */
function showPins() {
	var xmlhttp = createHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			createHTML(xmlhttp);
		}
	}
	xmlhttp.open('GET', '/list', false);
	xmlhttp.setRequestHeader("Content-Type",
			"application/x-www-form-urlencoded");
	xmlhttp.send(null);
}

/**
 * HttpRequest生成
 */
function createHttpRequest() {
	var xmlhttp = null;
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else {
	}
	if (xmlhttp == null) {
		console.error("Can not create an XMLHTTPRequest instance");
	}
	return xmlhttp;
}

/**
 * 保存データの表示
 */
function createHTML(xmlhttp) {
	var result = document.getElementById("result");
	var resultText = '<table><tr>'
			+ '<td style="background:#0000FF;padding:4px;color:#FFFFFF;width:200px;text-align:center;">水族館名</td>'
			+ '<td style="background:#0000FF;padding:4px;color:#FFFFFF;width:300px;text-align:center;">住所</td>'
			+ '<td style="background:#0000FF;padding:4px;color:#FFFFFF;width:100px;text-align:center;">経度</td>'
			+ '<td style="background:#0000FF;padding:4px;color:#FFFFFF;width:100px;text-align:center;">緯度</td>'
			+ '</tr>';
	var json = JSON.parse(xmlhttp.responseText);
	if (json.length > 0) {
		for (var i = 0; i < json.length; i++) {
			createPin(json[i]);
			resultText = resultText + '<tr><td style="text-align:center;">'
					+ json[i].name + '</td><td style="text-align:left;">'
					+ json[i].address + '</td><td style="text-align:center;">'
					+ json[i].lat + '</td><td style="text-align:center;">'
					+ json[i].lng + '</td></tr>'
		}
		resultText = resultText + '</table>';
		result.innerHTML = resultText;
		document.getElementById('name').value = '';
	}
}

function createPin(json) {
	var latlng = new google.maps.LatLng(json.lat, json.lng);
	var marker = new google.maps.Marker(
			{
				map : map,
				icon : 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=水|3366FF|ffffff',
				position : latlng,
				title : json.name
			});
	google.maps.event.addListener(marker, 'click', function(event) {
		new google.maps.InfoWindow({
			content : json.name + '<br />経度:' + json.lat + '<br/>緯度:'
					+ json.lng
		}).open(marker.getMap(), marker);
	});
}

google.maps.event.addDomListener(window, 'load', init);