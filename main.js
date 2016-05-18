var lat = 0;
var lng = 0;

var area;

function drawRadius(lat, lng, radius)
{
	area = new google.maps.Circle({ strokeColor : '#0000FF',
			strokeOpacity : 0.8,
			strokeWeight: 2,
			fillColor : '#0000FF',
			fillOpacity : 0.35,
			map : map,
			center : { lat : lat, lng : lng},
			radius : radius});
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
		})
	});

}

$(function(){
	$('#radius').on('change', function(){
		console.log($(this).val());
		drawRadius(lat, lng, parseInt($(this).val()));
	})
})