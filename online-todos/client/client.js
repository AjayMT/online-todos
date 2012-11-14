Template.mainContent.user = function () {
	return Meteor.user();
}

Template.loginForm.destroyed = function () {
	Meteor.absoluteUrl(Meteor.userId());
}

Template.todosUI.lists = function () {
	return Lists.find({}, { sort: { name: 1 } });
}

Template.todosUI.activeList = function () {
	if (Session.equals("currentList", this._id)) {
		return "active";
	}
	return "";
}

Template.todosUI.events({
	"click li.list": function () {
		Session.set("currentList", this._id);
	},
	"click input.check": function () {
		// Make item state completed.
	}
});

Template.todosUI.items = function () {
	return Items.find({ list: Session.get("currentList") }, { sort: { priority: -1 } });
}
