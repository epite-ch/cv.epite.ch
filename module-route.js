module.exports = function (view) {
	return function (req, res) {
		return res.render(view);
	};
};
