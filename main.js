var lat = 0;
var lng = 0;

var area;
var crimes;

var heatmap;

var currDate = new Date();
var startDate = new Date();

//formats a date for passing into date parameter of api request
function formatDate(date)
{
	var year = date.getFullYear();
	var month = date.getMonth() + 1; //add 1 because js months are 0-indexed
	
	if( month < 10 )
		month = '0' + month;
	
	return year + '-' + month;
}

function inRadius(lat1, lng1, lat2, lng2, radius)
{
	var latLngA = new google.maps.LatLng({lat: lat1, lng: lng1});
	var latLngB = new google.maps.LatLng({lat: lat2, lng: lng2});
	var dist = google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB);
	return dist <= radius;
}

function changeRadius(lat, lng, radius)
{
	area.setMap(null);
	area = new google.maps.Circle({ strokeColor : '#0000FF',
			strokeOpacity : 0.5,
			strokeWeight: 2,
			fillColor : '#0000FF',
			fillOpacity : 0.1,
			map : map,
			center : { lat : lat, lng : lng},
			radius : radius});
}

function aggregate(data)
{
	console.log('Crimes in the last month:' + data.length);
	
	var dict = {};
	for(var i = 0; i < data.length; i++)
	{
		var cat = data[i].category;
		if(dict[cat] == undefined)
			dict[cat] = 1;
		else
			dict[cat] += 1;
	}
	console.log(data);
	console.log(dict);
	console.log(JSON.stringify(dict));
}

function drawHeatmap(data)
{
	var heatmapData = [];
	for(var i = 0; i < data.length;  i++)
	{
		heatmapData.push( new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude) );
	}
	
	//var heatmap = new google.maps.visualization.HeatmapLayer({ data : heatmapData});
	heatmap.setData( heatmapData );
	heatmap.setMap(map);
}

function getLocalData(date)
{
	if(date == undefined)
		var date = '';
	
	$.get('https://data.police.uk/api/crimes-street/all-crime',
		{lat : lat,
		 lng : lng,
		 date : date})
	.done( function(data){
		crimes = data;
		aggregate(data);
		drawHeatmap(data);
	})
}

function initMap()
{
	heatmap = new google.maps.visualization.HeatmapLayer();
	//Get user's current location and focus map
	navigator.geolocation.getCurrentPosition(function(position) {
		
		lat = position.coords.latitude;
		lng = position.coords.longitude;

		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: lat, lng: lng},
			zoom: 15
		});
		
		area = new google.maps.Circle({ strokeColor : '#0000FF',
			strokeOpacity : 0.8,
			strokeWeight: 2,
			fillColor : '#0000FF',
			fillOpacity : 0.35,
			map : map,
			center : { lat : lat, lng : lng},
			radius : 1600});
	
		$.get('https://data.police.uk/api/locate-neighbourhood',
			{q : lat+','+lng}
		)
		.done( function(data){
			console.log(data);
			
		})
		
		//date = formatDate(currDate);
		getLocalData(date);
	});

}

$(function(){
	$('#radius').on('change', function(){
		var radius = parseInt($(this).val());
		console.log($(this).val());
		changeRadius(lat, lng, parseInt($(this).val()));
		var nearCrimes = crimes.filter( function(item){
			var crimeLat = parseFloat(item.location.latitude);
			var crimeLng = parseFloat(item.location.longitude);
			return inRadius(lat, lng, crimeLat, crimeLng, radius);
		})
		aggregate(nearCrimes);
	})
})