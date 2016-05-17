var lat = 0;
var lng = 0;

function initMap()
{
	//Get user's current location and focus map
	navigator.geolocation.getCurrentPosition(function(position) {
		
		lat = position.coords.latitude;
		lng = position.coords.longitude;

		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: lat, lng: lng},
			zoom: 13
		});
	
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
			console.log(data);
			
		})
	});

}