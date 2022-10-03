$(function() {
	var $container = $('<div style="width:0;height:0;overflow:hidden"></div>').prependTo(document.body);

	$.get('./assets/img/svg/sprite.svg', function (data) {
		$container.append(typeof XMLSerializer != 'undefined'
			? (new XMLSerializer()).serializeToString(data.documentElement)
			: $(data.documentElement).html());
	});
})