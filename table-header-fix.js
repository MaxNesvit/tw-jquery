(function($) {

	$.fn.twTableHeaderFix = function(options) {

		var settings = $.extend({}, options);
		var $element = $(this);
		var widthOfCols = [];
		var $thead = $element.find('thead');

		$element.find('thead th').each(function(index, element) {
			widthOfCols.push($(element).css('width'));
			$element.find('tbody tr:first-child td:nth-child(' + (index + 1) + ')')
				.css('width', $(element).css('width'));
		});

		$(document).on('scroll', function() {
			var coords = $element[0].getBoundingClientRect();
			if (coords.top < 0) {
				$thead.css('position', 'fixed');
				$thead.css('top', '1px');
				$thead.find('th').each(function(index, element) {
					$(element).css('width', widthOfCols[index]);
				});			
			} else {
				$thead.css('position', 'static');
			}
		});

		return this;
	}

})(jQuery);
