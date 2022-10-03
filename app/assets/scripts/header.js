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
})