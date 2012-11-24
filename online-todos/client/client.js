Template.mainContent.user = function () {
	return Meteor.user();
}

Template.loginForm.destroyed = function () {
	Meteor.absoluteUrl(Meteor.userId());
}

Template.todosUI.lists = function () {
	return Lists.find({ user: Meteor.userId() }, { sort: { name: 1 } });
}

Template.todosUI.activeList = function () {
	if (Session.equals("currentList", this._id)) {
		return "active";
	}
	return "";
}

Template.todosUI.events({
	"click a.list": function () {
		if (Lists.findOne(this._id)) {
			Session.set("currentList", this._id);
		}
	},
	"click input.check": function () {
		if (this.completed == "true") {
			Items.update({ list: Session.get("currentList"), user: Meteor.userId() },
						 { $set: { completed: "" } });
		} else {
			Items.update({ list: Session.get("currentList"), user: Meteor.userId() },
						 { $set: { completed: "true" } });
		}
	},
	"click button.saveList": function () {
		var value = document.getElementsByName("listName")[0].value;
		if (value != "") { Lists.insert({ name: value, user: Meteor.userId() }); }
		else { alert("You need to enter a name."); }
		document.getElementsByName("listName")[0].value = "";
	},
	"click button.removeList": function () {
		Items.remove({ list: this._id, user: Meteor.userId() });
		Lists.remove({ _id: this._id, user: Meteor.userId() });
		Session.set("currentList", "");
	},
	"click button.saveItem": function () {
		var name = document.getElementsByName("itemName")[0].value;
		document.getElementsByName("itemName")[0].value = "";
		var priority = parseInt(document.getElementsByName("itemPriority")[0].value);
		document.getElementsByName("itemPriority")[0].value = "";
		Items.insert({ list: Session.get("currentList"), user: Meteor.userId(),
					   name: name, priority: priority, completed: "" });
	},
	"click button.removeItem": function () {
		Items.remove(this._id);
	},
	"click a.completed": function () {
		Session.set("currentList", "completed");
	},
	"click a.pending": function () {
		Session.set("currentList", "pending");
	}
});

Template.todosUI.items = function () {
	if (Session.equals("currentList", "completed")) {
		return Items.find({ user: Meteor.userId(), completed: "true" });
	} else if (Session.equals("currentList", "pending")) {
		return Items.find({ user: Meteor.userId(), completed: "" });
	}
	return Items.find({ list: Session.get("currentList"), user: Meteor.userId() },
					  { sort: { priority: -1 } });
}

Template.todosUI.completed = function () {
	if (Session.equals("currentList", "completed")) {
		return "active";
	}
	return "";
}

Template.todosUI.pending = function () {
	if (Session.equals("currentList", "pending")) {
		return "active";
	}
	return "";
}

Template.todosUI.selectedList = function () {
	return Session.get("currentList");
}
