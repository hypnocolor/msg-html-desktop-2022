$(function () {
	$(document).on('click', '.single-product-gallery__thumb', function (e) {
		e.preventDefault();
		if (!$(this).hasClass('single-product-gallery__thumb--active')) {
			$(this)
				.addClass('single-product-gallery__thumb--active')
				.siblings('a')
				.removeClass('single-product-gallery__thumb--active')

			var newImageSrc = $(this).data('load-image');

			$('.single-product-gallery__full-image img').attr('src', newImageSrc);
		}
	});

	$(document).on('click', '[data-expand-reviews]', function (e) {
		e.preventDefault();
		$(this).hide(0).parents().find('[data-hidden-reviews]').addClass('js-visible');
	});

	$('.single-product-tabs__list').onePageNav({
		currentClass: 'single-product-tabs__item--active',
		changeHash: false,
		scrollSpeed: 750,
		scrollThreshold: 0.2,
		scrollOffset: 100,
		filter: '',
		begin: function () {
			//I get fired when the animation is starting
		},
		end: function () {
			//I get fired when the animation is ending
		},
		scrollChange: function ($currentListItem) {
			//I get fired when you enter a section and I pass the list item of the section
		}
	});

	autosize($('.single-product-review-form__text'));
})