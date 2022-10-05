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
	});


	$('[data-cards-carousel]').each(function () {
		var $thisSlider = $(this).find('[data-cards-carousel-shaft]'),
			$thisSliderPrev = $(this).find('[data-cards-carousel-prev]'),
			$thisSliderNext = $(this).find('[data-cards-carousel-next]');

		$thisSlider.slick({
			infinite: true,
			dots: false,
			arrows: true,
			prevArrow: $thisSliderPrev,
			nextArrow: $thisSliderNext,
			adaptiveHeight: false,
			slidesToShow: 4,
			slidesToScroll: 1,
		});
	});



	$('.new-catalog-filters-price__input').label_better({
		position: "top", // This will let you define the position where the label will appear when the user clicked on the input fields. Acceptable options are "top", "bottom", "left" and "right". Default value is "top".
		animationTime: 100, // This will let you control the animation speed when the label appear. This option accepts value in milliseconds. The default value is 500.
		// easing: "ease-in-out", // This option will let you define the CSS easing you would like to see animating the label. The option accepts all default CSS easing such as "linear", "ease" etc. Another extra option is you can use is "bounce". The default value is "ease-in-out".
		offset: -5, // You can add more spacing between the input and the label. This option accepts value in pixels (without the unit). The default value is 20.
		hidePlaceholderOnFocus: true // The default placeholder text will hide on focus
	});

	$('.new-catalog-filters').on('reset', function (e) {
		$(document).find('.new-catalog-filters .lb_label').remove();
	});

	$(document).on('click', '.new-catalog-filters input[type="checkbox"]', function (e) {
		e.stopPropagation();
		var floatingSubmitPos = $(this).offset().top - $('.new-catalog-filters').offset().top - 20;
		$('.new-catalog-filters__floating-submit').css('top', floatingSubmitPos + 'px').addClass('js-visible');
	});

	$(document).on('click', function (e) {
		$('.new-catalog-filters__floating-submit').removeClass('js-visible');
	});
	$(document).on('click', '.new-catalog-filters__floating-submit', function (e) {
		e.stopPropagation();
	});

	$(document).on('click', '[data-expand-catalog-row]', function (e) {
		e.stopPropagation();
		$(this).parents('.new-catalog-row').toggleClass('js-expanded');
	});
});