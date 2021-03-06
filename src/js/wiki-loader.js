;(function($, document, window, undefined) {
	// Optional, but considered best practice by some
	"use strict";

	// Name the plugin so it's only in one place
	var pluginName = 'WikiLoader';

	// Default options for the plugin as a simple object
	var defaults = {
		loading_indicator: '/images/loading.svg'
	};

	// Plugin constructor
	// This is the boilerplate to set up the plugin to keep our actual logic in one place
	function Plugin(element, options) {
		this.element = element;

		// Merge the options given by the user with the defaults
		this.options = $.extend({}, defaults, options)

		// Attach data to the elment
		this.$el      = $(element);
		this.$el.data(name, this);

		this._defaults = defaults;

		var meta      = this.$el.data(name + '-opts');
		this.opts     = $.extend(this._defaults, options, meta);

		// Initialization code to get the ball rolling
		// If your plugin is simple, this may not be necessary and
		// you could place your implementation here
		this.init();
	}

	Plugin.prototype = {
		init: function() {
			var loading_element = this.$el;
			loading_element.html('<img class="loading" src="/images/loading.svg"/>');

			var all_pages = {};
			$('div[data-wiki-page]').each(function(i, e) {
				var page = $(e).attr('data-wiki-page');
				if (!(page in all_pages)) {
					all_pages[page] = [];
				}
				if (e.id) {
					var selector = '#' + e.id;
					all_pages[page].push({selector: selector, callback: $(e).attr('data-wiki-post-process'), showWikiLink: $(e).attr('data-wiki-show-link')});
				}
			});

			function fail_message(selector) {
				var fail_message = 'Read more about it here.';
				if ($(selector).attr('data-wiki-fail-message'))
				{
					fail_message = $(selector).attr('data-wiki-fail-message');
				}
				return fail_message;
			}

			function display_fail(page, selectors)
			{
				for (var i in selectors) {
					var s = selectors[i];
					var content = '<a href="' + page + s.selector + '">' + fail_message(s.selector) + '</a>.';
					$(s.selector).html(content);
				}
				loading_element.hide();
			}

			for (var page in all_pages)
			{
				var selectors = all_pages[page];
				$.ajax( {
					url: page
				})
					.done(function(data) {
						var wikiPage = $(data);
						for (var i in selectors) {
							var s = selectors[i];
							var content = $(s.selector, wikiPage);
							if (content.length > 0) {
								if (s.callback) {
									var post_process;
									eval("post_process = " + s.callback);
									if (typeof(post_process) !== "undefined") {
										post_process(content);
									}
								}
								$(s.selector).empty().append(content.html());
								if (s.showWikiLink === "true")
								{
									var link = '<a href="' + page + s.selector + '">' + fail_message(s.selector) + '</a>';
									$(s.selector).append(link);
								}
							} else {
								display_fail(page, selectors);
							}
						}
						loading_element.hide();
					})
					.fail(function() {
						display_fail();
					});
			}
		}
	};

	$.fn[pluginName] = function(options) {
		// Iterate through each DOM element and return it
		return this.each(function() {
			// prevent multiple instantiations
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};


})(jQuery, document, window);