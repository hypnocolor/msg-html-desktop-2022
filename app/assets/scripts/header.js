$(function () {
	var prevScrollpos = window.pageYOffset; // save the current position
	var headerDiv = document.querySelector(".new-header");
	var headerBottom = headerDiv.offsetTop + headerDiv.offsetHeight;

	window.onscroll = function () {
		var currentScrollPos = window.pageYOffset;

		/* if we're scrolling up, or we haven't passed the header, show the header */
		if (prevScrollpos > currentScrollPos || currentScrollPos < headerBottom) {
			headerDiv.style.top = "0";
		}
		else {
			/* otherwise we're scrolling down & have passed the header so hide it */
			headerDiv.style.top = "-50px";
		}

		prevScrollpos = currentScrollPos;
	}

	$('.search-form__input').on('focus', function (e) {
		$('.new-header-bottom__part--main').addClass('js-wide');
		$('.new-header-bottom__part--cart').addClass('js-hidden');
	});
	$('.search-form__input').on('blur', function (e) {
		setTimeout(function () {
			$('.new-header-bottom__part--main').removeClass('js-wide');
			$('.new-header-bottom__part--cart').removeClass('js-hidden');
		}, 100)
	});


	// Autocomplete
	var autoCompleteJS = new autoComplete({
		selector: '.search-form__input',
		data: {
			src: [
				"Гипсокартон",
				"Гипсокартон и комплектующие",
				"Гипсокартон ГКЛ 9, 5 мм обычный 1200х2500мм Danogips 76 шт в палете",
				"Гипсокартон ГКЛ 9, 5мм обычный 1200х2500мм ГИПРОК ЛАЙТ(66шт в палете)",
				"Гипсокартон ГКЛ 12, 5мм обычный 1200х3000мм Danogips 68шт / па",
				"Гипсокартон ГКЛ 12, 5мм обычный 1200х2500мм Кнауф(52)",
			]
		},
		resultItem: {
			highlight: true,
		},
		submit: true,
		events: {
			input: {
				selection: function (event) {
					var selection = event.detail.selection.value;
					autoCompleteJS.input.value = selection;
					$('.search-form').submit();
				}
			}
		}
	});


	$(document).on('open', '.search-form__input', function (e) {
		$('.search-results-fade').addClass('js-visible');
	});

	// document.querySelector(".search-form__input").addEventListener("open", function (event) {
	// 	// "event.detail" carries the autoComplete.js "feedback" object
	// 	$('.search-results-fade').addClass('js-visible');
	// });
	document.querySelector(".search-form__input").addEventListener("close", function (event) {
		// "event.detail" carries the autoComplete.js "feedback" object
		$('.search-results-fade').removeClass('js-visible');
	});
})