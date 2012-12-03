Meteor.Router.add({
	"/": function () {
		if (Meteor.user()) {
			Meteor.Router.to("/todos/");
			return "todosUI";
		}
		return "loginForm";
	},
	"/todos": function () {
		if (!Meteor.user()) {
			Meteor.Router.to("/");
			return "loginForm";
		}
		return "todosUI";
	}
});

Template.loginForm.destroyed = function () {
	Meteor.Router.to("/todos/");
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
		if (this.completed == "checked='true'") {
			Items.update(this._id, { $set: { completed: "" } });
		} else {
			Items.update(this._id, { $set: { completed: "checked='true'" } });
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
		if (name != "" && priority) {
			Items.insert({ list: Session.get("currentList"), user: Meteor.userId(),
						   name: name, priority: priority, completed: "" });
		} else {
			alert("We got an error. Check your stuff and try again. (Make sure the priority field is a number.)");
		}
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
		return Items.find({ user: Meteor.userId(), completed: "checked='true'" },
						  { sort: { priority: -1 } });
	} else if (Session.equals("currentList", "pending")) {
		return Items.find({ user: Meteor.userId(), completed: "" },
						  { sort: { priority: -1 } });
	}
	return Items.find({ list: Session.get("currentList"), user: Meteor.userId() },
					  { sort: { priority: -1 } });
}

Template.todosUI.completedList = function () {
	if (Session.equals("currentList", "completed")) {
		return "active";
	}
	return "";
}

Template.todosUI.pendingList = function () {
	if (Session.equals("currentList", "pending")) {
		return "active";
	}
	return "";
}

Template.todosUI.selectedList = function () {
	return Session.get("currentList");
}
