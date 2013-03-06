(function () {
	function staticView (view) {
		return function renderView (req, res) {
			return res.render(view);
		};
	};

	module.exports = staticView;
})();
