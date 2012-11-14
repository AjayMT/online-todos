Template.mainContent.user = function () {
	return Meteor.user();
}

Template.loginForm.destroyed = function () {
	Meteor.absoluteUrl(Meteor.userId());
}
