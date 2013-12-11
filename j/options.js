$(document).ready(function(){

	var table = {
		place: $('.blocked-list'),
		addRow: function(key) {
			table.place.append('<tr><td>'+ key +'</td><td>'+ '<input type="button" class="btn btn-danger remove-key_action" value="Разблокировать" id="'+key+'">' +'</td></tr>');
		},
		check: function() {
			return !$.isEmptyObject(SB.getAllBlocked());
		},
		setEmpty: function() {
			table.place.append('<tr><td colspan="2">Пока здесь пусто, заблокируй сайт и он появится в этом списке</td></tr>');
		},
		remove: function(row) {
			row.parents('tr').remove();
		}
	}

	var list = SB.getAllBlocked();
	if (table.check()) {
		for (var key in list) {
			table.addRow(key);
		}
	} else {
		table.setEmpty();
	}

	$('.remove-key_action').on('click', function() {
		SB.removeBlock($(this).attr('id'));
		table.remove($(this));

		if (!table.check()) {
			table.setEmpty();
		}
	});
});