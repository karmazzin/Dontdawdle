$(document).ready(function(){
	var list = SB.getAll();
	for (var key in list) {
		$('#blocklist').append('<div>'+ key +' '+'</div>');
	}

});