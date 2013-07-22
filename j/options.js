$(document).ready(function(){
	var list = SB.getAllBlocked();
	for (var key in list) {
		$('#blocklist').append('<div>'+ key +' '+'</div>');
	}

});