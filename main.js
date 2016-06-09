/* TODO
 * search for address on pressing enter
 * allow for date range
 * doesn't update stats when changing to radius with no crimes in e.g. 100
*/

var lat = 0;
var lng = 0;
var radius = 1600;

var area;
var crimes;
var dateRange;

//Single API objects
var geocoder;
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
	if(area != undefined)
		area.setMap(null);
	area = new google.maps.Circle({ strokeColor : '#0000FF',
			strokeOpacity : 0.5,
			strokeWeight: 2,
			fillColor : '#0000FF',
			fillOpacity : 0,
			map : map,
			center : { lat : lat, lng : lng},
			radius : radius});
}

function formatResults(data)
{
	var result = '<table>';
	for(key in data)
	{
		result += '<tr class="record">';
		result += '<td class="type">' + key + '</td>';
		result += '<td class="number">' + data[key] + '</td></td>';
	}
	result += '</table>';
	return result;
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

	if(data[0] != undefined)
		dateRange = data[0].month;
	var summary = '<div class="date"> Showing data for '+ dateRange +' within ' + radius + 'm</div>';
	summary += formatResults(dict);
	$('#summary').html(summary);
}

function drawHeatmap(data)
{
	var heatmapData = [];
	for(var i = 0; i < data.length;  i++)
	{
		heatmapData.push( new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude) );
	}

	heatmap.setData( heatmapData );
	heatmap.setMap(map);
}

function getLocalData(date)
{
	console.log('date = ' + date);
	var args = {
		lat : lat,
		lng : lng};
	
	if(date != undefined  && date != '')
		args['date'] = date;
	
	$.get('https://data.police.uk/api/crimes-street/all-crime',
		args)
	.done( function(data){
		crimes = data;
		drawHeatmap(crimes);
		var nearCrimes = crimes.filter( function(item){
			var crimeLat = parseFloat(item.location.latitude);
			var crimeLng = parseFloat(item.location.longitude);
			return inRadius(lat, lng, crimeLat, crimeLng, radius);
		})
		aggregate(nearCrimes);
	})
}

function initMap()
{
	geocoder = new google.maps.Geocoder();
	heatmap = new google.maps.visualization.HeatmapLayer();
	//Get user's current location and focus map
	navigator.geolocation.getCurrentPosition(function(position) {
		
		lat = position.coords.latitude;
		lng = position.coords.longitude;

		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: lat, lng: lng},
			zoom: 14
		});
		
		changeRadius(lat, lng, radius);
	
		$.get('https://data.police.uk/api/locate-neighbourhood',
			{q : lat+','+lng}
		)
		.done( function(data){
			console.log(data);
			
		})

		getLocalData();
	});

}

$(function(){
	$('#radius').on('change', function(){
		radius = parseInt($(this).val());
		console.log($(this).val());
		changeRadius(lat, lng, parseInt($(this).val()));
		var nearCrimes = crimes.filter( function(item){
			var crimeLat = parseFloat(item.location.latitude);
			var crimeLng = parseFloat(item.location.longitude);
			return inRadius(lat, lng, crimeLat, crimeLng, radius);
		})
		aggregate(nearCrimes);
	});
	
	$('#search').on('click', function(){
		var address = document.getElementById("address").value;
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK)
			{
				lat = results[0].geometry.location.lat();
				lng = results[0].geometry.location.lng();
				map.setCenter(results[0].geometry.location);
				map.setZoom(14);
				
				changeRadius(lat, lng, radius);
				
				getLocalData();
				
				console.log(results);
			} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
    });
	})
})