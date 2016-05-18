var lat = 0;
var lng = 0;

var area;
var crimes;

function inRadius(lat1, lng1, lat2, lng2)
{
	var latLngA = { lat : lat1, lng : lng1 };
	var latLngB = { lat : lat2, lng : lng2 };
	console.log(google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB));
}

function changeRadius(lat, lng, radius)
{
	area.setMap(null);
	area = new google.maps.Circle({ strokeColor : '#0000FF',
			strokeOpacity : 0.8,
			strokeWeight: 2,
			fillColor : '#0000FF',
			fillOpacity : 0.35,
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

function initMap()
{
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
		
		$.get('https://data.police.uk/api/crimes-street/all-crime',
			{lat : lat,
			 lng : lng}
		)
		.done( function(data){
			crimes = data;
			aggregate(data);
		})
	});

}

$(function(){
	$('#radius').on('change', function(){
		console.log($(this).val());
		changeRadius(lat, lng, parseInt($(this).val()));
		aggregate(crimes);
	})
})