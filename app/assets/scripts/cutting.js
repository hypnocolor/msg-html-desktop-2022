$(function() {
	$.fn.inputFilterDigits = function(inputFilter) {
		return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
			if (inputFilter(this.value)) {
				this.oldValue = this.value;
				this.oldSelectionStart = this.selectionStart;
				this.oldSelectionEnd = this.selectionEnd;
			} else if (this.hasOwnProperty("oldValue")) {
				this.value = this.oldValue;
				this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
			} else {
				this.value = "";
			}
		});
	};

	function inputsFilter() {
		$(document).find('.cut-single-type__qty-input').each (function () {
			$(this).inputFilterDigits(function(value) {
				return /^\d*$/.test(value);
			})
		})
	}

	inputsFilter();

	$(document).on('click', '.cut-single-type', function (e) {
		if (!$(this).hasClass('cut-single-type_expanded') && !$(e.target).hasClass('cut-single-type__qty') && !$(e.target).hasClass('cut-single-type__qty-input')) {
			$(this)
				.addClass('cut-single-type_expanded')
				.siblings('.cut-single-type')
				.removeClass('cut-single-type_expanded');
		}
	});

	$(document).on('click', '.cut-single-type__qty', function (e) {
		console.log($(e.target).hasClass('cut-single-type__qty-input'));
		if (!$(e.target).hasClass('cut-single-type__qty-input')) {
			$(this)
				.parents('.cut-single-type')
				.toggleClass('cut-single-type_expanded')
				.siblings('.cut-single-type')
				.removeClass('cut-single-type_expanded');
		}
	});

	$(document).on('click', '[data-cut-button]', function (e) {
		e.preventDefault();
		$(this).parents('.cart-single-item').find('[data-cut-block]').toggle();
	});

	$(document).on('click', '[data-save-cut-types]', function (e) {
		e.preventDefault();
		$(this).parents('[data-cut-block]').toggle();
	});


	function bubbleSort(array) {
		var done = false;
		while (!done) {
			done = true;
			for (var i = 1; i < array.length; i += 1) {
				if (array[i - 1] > array[i]) {
					done = false;
					var tmp = array[i - 1];
					array[i - 1] = array[i];
					array[i] = tmp;
				}
			}
		}

		return array;
	}

	$.bridget('draggabilly', Draggabilly);

	// Set and update points

	function setCuttingPoint (pointIdPart, pointRail, cm2px, cursorPosition, pointPosition) {
		var pointRailPosition = pointRail.offset().left;
		var pointCmPosition;

		if (cursorPosition > 0) {
			pointCmPosition = Math.round(Math.floor(cursorPosition - pointRailPosition) / cm2px);
		} else {
			if (pointPosition && pointPosition > 0) {
				pointCmPosition = pointPosition
			}
		}

		if (pointCmPosition > 0) {
			pointRail
				.append('<div data-point-id="' + (pointIdPart.toString() + cutPointId().toString() + '_' + pointCmPosition.toString()) + '" class="cut-single-type-armature__test-point" style="left: ' + cm2px * pointCmPosition + 'px" data-point-cm="' + pointCmPosition + '" data-cm-px="' + cm2px + '" data-point-left="' + Math.floor(cursorPosition - pointRailPosition) + '"><button type="button" class="settings-button"></button></div>');
			 // + pointRail.find('[data-point-id]').length +
			updatePointDistances();
		}

		$(document).find('[data-point-id]').each (function () {
			var thisPointId = $(this).data('point-id');

			var $draggable = $(this).draggabilly({
				axis: 'x',
				grid: [1, 0],
				containment: pointRail
			});

			var draggie = $draggable.data('draggabilly');

			$draggable.on('dragMove', function () {
				updateCuttingPointByDrag(thisPointId, draggie.position.x);
			});

			$draggable.on('dragStart', function () {
				updatePointDistances();
				$(this).parents('[data-cut-rail]').find('[data-point-id] span').hide();
			});

			$draggable.on('dragEnd', function () {
				updatePointDistances();
				$(this).parents('[data-cut-rail]').find('[data-point-id] span').show();
			});
		})
	}

	function updateCuttingPoint (pointId, pointValue) {
		var $pointToUpdate = $(document).find('[data-point-id="' + pointId + '"]');
		var cm2px = $pointToUpdate.data('cm-px');

		$pointToUpdate.attr('data-point-cm', pointValue);
		$pointToUpdate.data('point-cm', +pointValue);
		$pointToUpdate.css('left', (cm2px * pointValue).toString() + 'px');

		updatePointDistances();
	}

	function updateCuttingPointByDrag (pointId, pxValue) {
		var $pointToUpdate = $(document).find('[data-point-id="' + pointId + '"]');
		var cm2px = $pointToUpdate.data('cm-px');

		$pointToUpdate.attr('data-point-cm', Math.round(pxValue / cm2px));
		$pointToUpdate.data('point-cm', Math.round(pxValue / cm2px));
	}

	function removeCuttingPoint (pointId) {
		$(document).find('[data-point-id="' + pointId + '"]').remove();
		updatePointDistances();
	}

	// Presets

	function setCuttingPreset (cutRail, cutQty) {
		cutRail.find('[data-point-id]').remove();
		updatePointDistances();

		var cutRailWidth = cutRail.data('width');
		var cutPointsDistance = parseInt (cutRailWidth / cutQty);


		var $thisCutPoint = $(this);
		var $thisCutPointRail = cutRail;
		var cutPointRailPosition = $thisCutPointRail.offset().left;
		var cutPointRailPositionEnd = cutPointRailPosition + $thisCutPointRail.outerWidth();

		var cutPointCm2Px;


		cutPointCm2Px = Math.round(($thisCutPointRail.outerWidth() / (+$thisCutPointRail.data('width'))) * 1000) / 1000;
		console.log(cutPointRailPosition);

		var pointIdPart = $thisCutPointRail.parents('[data-cut-block]').data('cut-block').toString() + $thisCutPointRail.data('cut-rail').toString();

		for (var i = 1; i < cutQty; i++) {
			setCuttingPoint(pointIdPart, $thisCutPointRail, cutPointCm2Px, ( Math.round(cutPointRailPosition)  + (cutPointsDistance * cutPointCm2Px) * i ));
		}
	}

	$(document).on('click', '[data-cut-preset]', function (e) {
		e.preventDefault();
		var $railForPresets = $(this).parents('[data-cut-block]').find('[data-single-cuts] > .cut-single-type_expanded [data-cut-rail]'),
			cutQty = +$(this).data('cut-preset');


		if ($railForPresets.length) {
			setCuttingPreset($railForPresets, cutQty);
		}
	})

	// Update distances

	function updatePointDistances ($pointsRail) {
		$(document).find('.cut-single-type-armature__rail').each(function () {
			var pointsArray = [], i = 0;

			var $thisRailPoints = $(this).find('[data-point-id]'),
				thisRailWidth = $(this).data('width'),
				thisRailCm2Px = $(this).find('[data-point-id]').data('cm-px');
			$thisRailPoints.each(function () {
				pointsArray.push($(this).data('point-cm'));
				$(this).html('')
			});

			var $thisSummaryString = $(this).parents('.cut-single-type__cuttings').find('.cut-single-type__summary p'),
				summaryTempString = '';


			bubbleSort(pointsArray);

			for (var i = 0; i < pointsArray.length; i++) {
				var pointsDistance = pointsArray[i + 1] - pointsArray[i];
				var pointsDistanceDisplay = (thisRailCm2Px * pointsDistance > 75) ? 'block': 'none';
				var pointsDistanceWidth = pointsDistance * thisRailCm2Px;

				var $currentPoint = $thisRailPoints.filter('[data-point-cm="' + pointsArray[i] + '"]');

				if ((i < (pointsArray.length - 1))) {

					$currentPoint
						.html('<span style="width: ' + pointsDistanceWidth + 'px">' + (pointsDistance) + ' мм</span>');
					summaryTempString += pointsDistance + '+';
				}

				if (i == (pointsArray.length - 1)) {

					$currentPoint
						.html('<span style="width: ' + ((thisRailWidth - pointsArray[i]) * thisRailCm2Px) + 'px">' + (thisRailWidth - pointsArray[i]) + ' мм</span>');
					summaryTempString += (thisRailWidth - pointsArray[i]);
				}

				if (i == 0) {
					$currentPoint.append('<span class="to-start" style="width: ' + pointsArray[i] * thisRailCm2Px + 'px">' + pointsArray[i] + ' мм</span>');
					// summaryTempString += 'f' + pointsArray[i] + '+';
				}

				$currentPoint.append('<button type="button" class="settings-button"></button>')
			}

			if (pointsArray.length) {
				summaryTempString = pointsArray[0] + '+' + summaryTempString;
			}

			if (summaryTempString.length) {
				$thisSummaryString.text(summaryTempString);
			} else {
				$thisSummaryString.text('Без резов');
			}
		});

		updateCuttingsSummary();
	}

	function updateCuttingsSummary () {
		$(document).find('[data-single-cuts]').each(function () {
			var commonCuttings = 0,
				$thisSummaryString = $(this).next('.cut-block__summary').find('.cut-block__summary-row_final p');

			$(this).find('> .cut-single-type').each(function () {
				var thisQty = $(this).find('.cut-single-type__qty-input').val();

				$(this).find('.cut-single-type-armature__rail').each(function () {
					commonCuttings += $(this).find('[data-point-id]').length * thisQty;
				});
			});

			if (commonCuttings) {
				$thisSummaryString.text(commonCuttings + ' × 15 ₽ = ' + (commonCuttings * 15) + ' ₽');
			} else {
				$thisSummaryString.text('');
			}
		})
	}

	function updateRailOffsets () {
		var $cutPointsRail = $(document).find('.cut-single-type-armature__rail');
		var cutPointsRailPosition = $cutPointsRail.offset().left;
		var cutPointsRailPositionEnd = cutPointsRailPosition + $cutPointsRail.outerWidth();

		var cutPointCm2Px;

		cutPointsRailPosition = $cutPointsRail.offset().left;
		cutPointsRailPositionEnd = cutPointsRailPosition + $cutPointsRail.outerWidth();
		cutPointCm2Px = Math.round(($cutPointsRail.outerWidth() / (+$cutPointsRail.data('width'))) * 1000) / 1000;
	}

	var cutPointsMaximum = 10;

	$(window).on('resize', function () {
		updateRailOffsets();
	});

	$(document).on('click', '.cut-single-type, [data-toggle-cart-details]', function (e) {
		setTimeout(function () {
			updateRailOffsets();
		}, 10);
	})

	// Add new cut type
	function makeIncrement () {
		var count = 1;

		return function () {
			return count++;
		}
	}

	var cutTypeId = makeIncrement(),
		cutPointId = makeIncrement();

	$('[data-new-cut-type]').on('click', function (e) {
		e.preventDefault();

		var cutTypeWidth = $(this).data('new-cut-type-width');

		var cutTypeQty = $(this).parents('[data-cart-details-qty]').data('cart-details-qty');

		var $cutTypeTemplate = $(this).parents('[data-cut-block]').find('.cut-block__type-template').clone();

		$cutTypeTemplate
			.find('[data-cut-rail]')
			.attr({
				'data-cut-rail': cutTypeId(),
				'data-width': cutTypeWidth,
			});

		$cutTypeTemplate
			.find('[data-single-cut-qty]')
			.attr('value', cutTypeQty);


		if (!$(this).parents('[data-cut-block]').find('.cut-block__content > [data-single-cut]').length) {
			$cutTypeTemplate
				.find('[data-single-cut]')
				.addClass('cut-single-type_expanded');
		}

		$(this).parents('[data-cut-block]').find('.cut-block__content').append($cutTypeTemplate.html());

		inputsFilter();
	});

	// Remove cut types

	$('[data-clear-cut-types]').on('click', function(e) {
		$(this).parents('[data-cut-block]').find('[data-single-cuts] > .cut-single-type_expanded').remove();
		updateCuttingsSummary();
	})

	// Move main point across the rail
	$(document).on('mousemove', '.cut-single-type-armature__rail', function (e) {
		var $thisCutPoint = $(this).find('.cut-single-type-armature__new-cut');

		var $thisCutPointRail = $thisCutPoint.parents('.cut-single-type-armature__rail');
		var cutPointRailPosition = $thisCutPointRail.offset().left;
		var cutPointRailPositionEnd = cutPointRailPosition + $thisCutPointRail.outerWidth();

		var cutPointCm2Px;
		var cutPointMm2Px;

		cutPointCm2Px = Math.round(($thisCutPointRail.outerWidth() / (+$thisCutPointRail.data('width'))) * 1000) / 1000;
		cutPointMm2Px = (Math.round(($thisCutPointRail.outerWidth() / (+$thisCutPointRail.data('width'))) * 1000) / 1000);

		var cutPointPosition = (e.clientX - cutPointRailPosition) + 'px',
			cutPointPositionPx = Math.floor(e.clientX - cutPointRailPosition),
			cutPointPositionCm = Math.round(cutPointPositionPx / cutPointCm2Px),
			cutPointPositionMm = (Math.round(cutPointPositionPx / cutPointMm2Px));

		var thisRailPoints = [],
			smallestPointValue = 0;

		$thisCutPointRail.find('[data-point-id]').each(function() {
			thisRailPoints.push(+$(this).data('point-cm'))
		});

		bubbleSort(thisRailPoints);

		if (thisRailPoints.length) {
			for (var i = 0; i < thisRailPoints.length; i++) {
				if (thisRailPoints[i] < cutPointPositionMm) {
					smallestPointValue = thisRailPoints[i];
				}
			}
			if (smallestPointValue) {
				cutPointPositionMm -= +$thisCutPointRail.find('[data-point-cm="' + smallestPointValue + '"]').data('point-cm');
			}
		}

		window.requestAnimationFrame(function() {
			if (e.clientX >= cutPointRailPosition && e.clientX <= cutPointRailPositionEnd) {
				$thisCutPoint.css('left', cutPointPosition);
				// $thisCutPoint.find('span strong').text(cutPointPositionCm);
				$thisCutPoint.find('span strong').text('+ ' + cutPointPositionMm);
			}
		});
	});

	// Set point on rail
	$(document).on('click', '.cut-single-type-armature__new-cut', function (e) {
		e.preventDefault();

		var $thisCutPoint = $(this);
		var $thisCutPointRail = $thisCutPoint.parents('.cut-single-type-armature__rail');
		var cutPointRailPosition = $thisCutPointRail.offset().left;
		var cutPointRailPositionEnd = cutPointRailPosition + $thisCutPointRail.outerWidth();

		var cutPointCm2Px;

		cutPointCm2Px = Math.round(($thisCutPointRail.outerWidth() / (+$thisCutPointRail.data('width'))) * 1000) / 1000;

		var pointIdPart = $(this).parents('[data-cut-block]').data('cut-block').toString() + $thisCutPointRail.data('cut-rail').toString();
		if (e.clientX >= cutPointRailPosition && e.clientX <= cutPointRailPositionEnd) {
			setCuttingPoint(pointIdPart, $thisCutPointRail, cutPointCm2Px, e.clientX);
		}
	});

	// Show popup with point settings
	$(document).on('click', '.cut-single-type-armature__test-point .settings-button', function (e) {
		e.preventDefault();
		var thisPointId = $(this).parents('.cut-single-type-armature__test-point').data('point-id'),
			thisPointCmVal = $(this).parents('.cut-single-type-armature__test-point').data('point-cm'),
			thisPointRailId = $(this).parents('[data-cut-rail]').data('cut-rail'),
			thisPointRailWidth = $(this).parents('[data-cut-rail]').data('width'),
			$thisCutBlock = $(this).parents('.cart-single-item');

		$.fancybox.open({
			margin: 0,
			padding: 0,
			closeBtn: false,
			width: '300',
			type: 'inline',
			href: '#accurate-cut-popup',
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
					"background": "transparent"
				});
				$('[data-settings-point-id]').data('settings-point-id', thisPointId);
				$('[data-settings-point-value]').val(thisPointCmVal).change();
				$('[data-settings-rail-id]').data('settings-rail-id', thisPointRailId);
				$('[data-settings-rail-width]').data('settings-rail-width', thisPointRailWidth);

				if ($thisCutBlock.data('accurate-cut-type')) {
					$('[data-select-accurate-cut-type]').val($thisCutBlock.data('accurate-cut-type')).change();
				}
			}
		});
	});

	// Remove point
	$(document).on('click', '[data-remove-cut-point]', function (e) {
		e.preventDefault();
		var pointToRemoveId = $(document).find('[data-settings-point-id]').data('settings-point-id');

		removeCuttingPoint(pointToRemoveId);
		$.fancybox.close();
	});

	// Update point
	$(document).on('click', '[data-save-cut-point]', function (e) {
		e.preventDefault();
		var pointToUpdateId = $(document).find('[data-settings-point-id]').data('settings-point-id');
		var pointValue = $('[data-settings-point-value]').val();
		var railId = $('[data-settings-rail-id]').data('settings-rail-id');
		var railWidth = $('[data-settings-rail-width]').data('settings-rail-width');

		var accurateCutType = $('[data-select-accurate-cut-type]').val();

		var $pointBlock = $('[data-cut-rail="' + railId + '"]').parents('.cart-single-item');
		$pointBlock.attr('data-accurate-cut-type', accurateCutType);
		console.log($pointBlock);

		var isValueExists = $(document).find('[data-cut-rail="' + railId + '"] [data-point-cm="' + pointValue
		 + '"]').length ? true : false;

		if (pointValue && (pointValue > 0) && (pointValue < railWidth) && !isValueExists) {
			var cm2px = $(document).find('[data-point-id="' + pointToUpdateId + '"]').data('cm-px');
			updateCuttingPoint(pointToUpdateId, pointValue);
			// $(document).find('[data-point-id="' + pointToUpdateId + '"]').css('left', (cm2px * $('[data-settings-point-value]').val()).toString() + 'px');
		}
		$.fancybox.close();
	});
});