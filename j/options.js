$(document).ready(function(){
	var list = SB.getAllBlocked();
	for (var key in list) {
		$('body').append('<div><span>'+ key +'</span><span>'+ '<input type="button" value="Разблокировать" class="remove" id="'+key+'">' +'</span></div>');
	}

	$('.remove').on('click', function() {
		SB.removeBlock($(this).attr('id'));
		$(this).parents('div').remove();
	});
});