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
		position: "top",
		animationTime: 100,
		offset: -5,
		hidePlaceholderOnFocus: true
	});

	$('.new-catalog-filters').on('reset', function (e) {
		$(document).find('.new-catalog-filters .lb_label').remove();
	});

	$(document).on('change', '.new-catalog-filters input[type="checkbox"]', function (e) {
		e.stopPropagation();
		var floatingSubmitPos = $(this).offset().top - $('.new-catalog-filters').offset().top - 20;
		$('.new-catalog-filters__floating-submit').css('top', floatingSubmitPos + 'px').addClass('js-visible');
	});

	$(document).on('keyup', '.new-catalog-filters-price__input', function (e) {
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

	tippy('.new-catalog-card-amount', {
		content: function (reference) {
			var dataText = reference.getAttribute('data-tip-text');
			var tipText = (dataText && dataText.length) ? dataText : 'Tip title';
			return tipText;
		},
		placement: 'top-start',
		arrow: '<svg width="16" height="6" xmlns="http://www.w3.org/2000/svg"><path d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z"></svg>',
	});
});