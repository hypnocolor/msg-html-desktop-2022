$(function () {
	$(document).on('click', '[data-toggle-filter-section]', function (e) {
		e.preventDefault();
		$(this).toggleClass('js-active');
	});

	// $(document).on('click', '[data-expand-catalog-links]', function (e) {
	// 	e.preventDefault();
	// 	$(this).hide(0).prev('[data-catalog-links]').find('li').addClass('js-visible');
	// });
	$(document).on('click', '[data-toggle-hidden-tags]', function (e) {
		e.preventDefault();
		var thisAmount = $(this).data('toggle-hidden-tags');
		$(this).text(function (i, text) {
			return text === 'Скрыть' ? thisAmount : 'Скрыть';
		});
		$(this).siblings('[data-hidden-tag]').toggleClass('js-hidden');
	});

	$(document).on('click', '[data-toggle-price-popup]', function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (!$(this).hasClass('js-active')) {
			$('[data-price-popup], [data-toggle-price-popup]').removeClass('js-active');
		}
		$(this).toggleClass('js-active').next('[data-price-popup]').toggleClass('js-active');
	})
	$(document).on('click', 'body', function (e) {
		$('[data-price-popup], [data-toggle-price-popup]').removeClass('js-active');
	})
});