/*
author: Developed by Stas Melnikov. http://stas-melnikov.ru
e-mail: melnik909@ya.ru
linkedIn: https://www.linkedin.com/in/melnik909
github: https://github.com/melnik909
facebook: https://www.facebook.com/melnik909
Template created with use of a Responsive Framework http://stas-melnikov.ru/responsive_elements/
*/

var ResponsiveUX = {
	
	initMap: function(){
			
		var mapCanvas = document.getElementById("map"),
		mapOptions ={
			center: new google.maps.LatLng(53.186162, 45.00961),
			zoom: 17,
			mapTypeId: google.maps.MapTypeId.roadmap,
			scrollwheel: false,
			scaleControl: false,
		},

		map = new google.maps.Map(mapCanvas, mapOptions),
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(53.186162, 45.00961),
			map: map,
			icon: 'icons/marker.svg',
		});
	},
	
	init: function(){
		
		var script = document.createElement("script"),
		body = $("body");
		
		script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDEN_8Sph4q9GwhWKKnsOP5bl4Frwyo3aM&amp;sensor=false&callback=ResponsiveUX.initMap";
		script.async = true;
		body.append(script);
		body.removeClass("preloader_active"); 
		
		$(".skills").addClass("skills_active");
		
		$(".menu__icon").on('click', function(){
			
			body.addClass("fullscreen-menu");
			
		});
		
		$(".menu-close").on( 'click', function(){
			
			body.removeClass("fullscreen-menu");
			
		});
		
		$(".scroll_js").on('click', function(event){
			
			event.preventDefault();
			
			var	target = $(this).attr('href'),
			position = ($(target).offset().top) - $(".header_js").outerHeight(); 
			
			if($(this).hasClass("mobile-menu__link")){
				
				body.removeClass("fullscreen-menu");

			}
			
			$("html, body").animate({scrollTop: position}, 800);
			
		});		
	}
};