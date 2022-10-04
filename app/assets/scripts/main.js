$(function() {

	$('[data-catalog-button]').on('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		$(this).toggleClass('js-active');
		$('.catalog-overlay').toggleClass('js-active');
	});

	$('.catalog-overlay, [data-catalog-side-panel], [data-toggle-cside-panel]').on('click', function (e) {
		e.stopPropagation();
	});

	$(document).keyup(function (e) {
		if (e.keyCode === 27) {
			$('[data-catalog-button], .catalog-overlay').removeClass('js-active');
		}
	});

	$(document).on('click', function () {
		$('[data-catalog-button], .catalog-overlay').removeClass('js-active');
		$('[data-catalog-side-panel]').removeClass('js-active');
		$('[data-address-popup]').removeClass('js-active');
	});

	$('[data-pcard-show-sizes]').on('click', function (e) {
		e.preventDefault();
		var hiddenBlockId = $(this).data('pcard-show-sizes');
		$(this).parents('.products-grid__col').siblings().find('[data-pcard-show-sizes]').removeClass('js-active')
		$('[data-hidden-sizes]').stop().slideUp(100);
		$(this).parents('.products-grid__col').siblings('.products-grid__col').removeClass('products-grid__col_focus');

		$(this).toggleClass('js-active');
		$(this).parents('.products-grid__col').toggleClass('products-grid__col_focus');
		$('[data-hidden-sizes=' + hiddenBlockId + ']').stop().slideToggle(200);
	});

	$('[data-pcatalog-list-expand]').on('click', function (e) {
		e.preventDefault();
		$(this).parents('[data-pcatalog-list-item]').toggleClass('js-active');
		$(this).parents('[data-pcatalog-list-item]').find('[data-hidden-details]').stop().toggle(0);
	});

	$('[data-toggle-cside-panel]').on('click', function (e) {
		$('[data-catalog-side-panel]').toggleClass('js-active');
	});

	// Order

	$('[data-fieldset-switching]').each(function () {
		var $switchers = $(this).find('[data-switch-fieldset]'),
			$fieldsets = $(this).find('[data-fieldset]');

		$switchers.on('change', function () {
			var fieldsetToSwitch = $(this).data('switch-fieldset');
			$fieldsets.attr('disabled', 'disabled').filter('[data-fieldset="' + fieldsetToSwitch + '"]').attr('disabled', false);
		});
	});

	$('[data-add-recipient-phone]').on('click', function (e) {
		e.preventDefault();
		var $clonedPhone = $('[data-recipient-phone-tmpl]').clone();
		$clonedPhone.removeAttr('data-recipient-phone-tmpl');
		$clonedPhone.find('.common-input').attr('disabled', false);

		$('[data-recipient-phones]').append($clonedPhone);
	});

	$('[data-toggle-cart-details]').on('click', function (e) {
		$(this).toggleClass('js-active');

		var detailsId = $(this).data('toggle-cart-details');
		$('[data-cart-details="' + detailsId + '"]').stop().toggle(0);
	});

	$('[data-show-address-popup]').on('click', function (e) {
		$('[data-address-popup]').toggleClass('js-active');
		e.stopPropagation();
	});

	$('[data-close-address-popup]').on('click', function (e) {
		$('[data-address-popup]').removeClass('js-active');
	});

	$('[data-address-popup]').on('click', function (e) {
		e.stopPropagation();
	});

	// Profile

	$('[data-set-photo-button]').on('click', function (e) {
		e.preventDefault();
		$('#add-profile-photo').trigger('click');
	});

	$('[data-reset-photo-button]').on('click', function (e) {
		e.preventDefault();
		$('#add-profile-photo').val('');
		$('.set-profile-photo__placeholder_uploaded').css('background-image', 'none').removeClass('active');
	});

	$('#add-profile-photo').on('change', function() {
		if (this.files) {
			var filesAmount = this.files.length;
			for (i = 0; i < filesAmount; i++) {
				var reader = new FileReader();
				reader.onload = function(event) {
					$('.set-profile-photo__placeholder_uploaded').css('background-image', 'url(' + event.target.result + ')').addClass('active');
				}
				reader.readAsDataURL(this.files[i]);
			}
		}
	});

	$('[data-toggle-documents]').on('click', function (e) {
		e.preventDefault();
		var toggleDoc = $(this).data('toggle-documents');
		$(this).toggleClass('js-active');
		$('[data-documents="' + toggleDoc + '"]').stop().slideToggle(200);
	});

	$('[data-toggle-order-details]').on('click', function (e) {
		e.preventDefault();
		var detailsToToggle = $(this).data('toggle-order-details');
		$(this).text(function (i, text) {
			return text === "Подробнее" ? "Свернуть" : "Подробнее";
		});

		$('[data-order-details="' + detailsToToggle + '"]').stop().slideToggle(200);
	});


	$('[data-floating-label]').label_better({
		position: "top",
		animationTime: 200,
		easing: "ease-in-out",
		offset: 0,
	});

	$('.common-select, .cart-block__wh-select').select2({
		minimumResultsForSearch: Infinity
	});

	$('[data-close-fbox]').on('click', function (e) {
		$.fancybox.close();
	});

	// Login

	$('[data-login-link]').on('click', function (e) {
		e.preventDefault();
		var thisHref = $(this).attr('href');
		console.log(thisHref);
		$.fancybox.open({
			margin: 0,
			padding: 0,
			closeBtn: false,
			width: 480,
			maxWidth: 980,
			type: 'inline',
			href: thisHref,
			openMethod: 'zoomIn',
			helpers: {
				overlay: {
					locked: false
				}
			},
			beforeShow : function() {
				$(".fancybox-skin").css({
					"box-shadow": "0px 0px 20px rgba(33, 42, 50, 0.15)",
					"background": "transparent"
				});
				$(".fancybox-overlay").css({
					// "background": "transparent"
				});
			}
		});
	})


	$('[data-login-email-input]').on('keyup', function (e) {
		var re = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		if($(this).val() && re.test($(this).val())) {
			$('[data-login-code-area="email"]').show();
			console.log('valid')
		} else {
			$('[data-login-code-area="email"]').hide();
			console.log('invalid')
		}
	});

	$('[data-login-type-button]').on('click', function(e) {
		e.preventDefault();
		var currentLoginType = $(this).data('login-type-button');
		$(this).text(function (i, text) {
			return text === "Войти по почте" ? "Войти по телефону" : "Войти по почте";
		});

		$('fieldset[data-login-type]')
			.attr('disabled', 'disabled')
			.filter('[data-login-type="' + currentLoginType + '"]')
			.attr('disabled', false);

		if (currentLoginType == "email") {
			// data-login-email-input
		}

		currentLoginType = (currentLoginType == "email") ? "phone" : "email";
		$(this).data('login-type-button', currentLoginType);
		$('[data-login-email-input], [data-login-phone-input]').val('').trigger("change");
		$('[data-login-button]').attr('disabled', true);
	});


	// Added to cart

	$('[data-add-cart-button]').on('click', function (e) {
		e.preventDefault();
		$.fancybox.open({
			margin: 0,
			padding: 0,
			closeBtn: false,
			width: '100%',
			maxWidth: 480,
			type: 'inline',
			href: '#thanks-popup',
			openMethod: 'zoomIn',
			helpers: {
				overlay: {
					locked: false
				}
			},
			beforeShow : function() {
				$(".fancybox-skin").css({
					"box-shadow": "0px 0px 20px rgba(33, 42, 50, 0.15)",
					"background": "transparent"
				});
				$(".fancybox-overlay").css({
					// "background": "transparent"
				});
			},
			afterShow : function() {
				setTimeout(function () {
					$.fancybox.close();
				}, 5000);
			},
		});
	});

	// One click

	$(document).on('click', '[data-one-click-button]', function (e) {
		e.preventDefault();
		$.fancybox.open({
			margin: 0,
			padding: 0,
			closeBtn: false,
			width: '100%',
			maxWidth: 980,
			type: 'inline',
			href: '#one-click-popup',
			openMethod: 'zoomIn',
			helpers: {
				overlay: {
					locked: false
				}
			},
			beforeShow : function() {
				$(".fancybox-skin").css({
					"box-shadow": "0px 0px 20px rgba(33, 42, 50, 0.15)",
					"background": "transparent"
				});
				$(".fancybox-overlay").css({
					// "background": "transparent"
				});
			}
		});
	});


	$('[data-close-popup]').on('click', function (e) {
		e.preventDefault();
		$.fancybox.close();
	});

	$('.new-catalog__part--sidebar').stickySidebar({
		topSpacing: 100,
		containerSelector: '.new-catalog',
		innerWrapperSelector: '.new-catalog-filters'
	});

});
