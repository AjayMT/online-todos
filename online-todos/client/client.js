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

Template.todosUI.tags = function () {
	return Tags.find({ user: Meteor.userId() }, { sort: { name: 1 } });
}

Template.todosUI.activeTag = function () {
	if (Session.equals("currentTag", this._id)) {
		return "active";
	}
	return "";
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
	"click a.tag": function () {
		if (Session.equals("currentTag", this._id)) {
			Session.set("currentTag", "");
		} else {
			Session.set("currentTag", this._id);
		}
	},
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
		var tagname = document.getElementsByName("itemTag")[0].value;
		document.getElementsByName("itemTag")[0].value = "";
		var tags = tagname.split(" ");
		if (name != "" && priority) {
			for (var i = 0; i < tags.length; i++) {
				var tag = Tags.findOne({ user: Meteor.userId(), name: tags[i] });
				if (tag == null) {
					Tags.insert({ user: Meteor.userId(), name: tags[i] })
				}
			}
			Items.insert({ list: Session.get("currentList"), user: Meteor.userId(),
						   name: name, priority: priority, completed: "", tags: tags });
		} else {
			alert("We got an error. Check your stuff and try again. (Make sure the priority field is a number.)");
		}
	},
	"click button.removeItem": function () {
		var tags = this.tags;
		var id = this._id;
		Items.remove(this._id);
		for (var i = 0; i < tags.length; i++) {
			var items = Items.find({ user: Meteor.userId(), tags: tags[i] }).fetch();
			if (items.length == 0) {
				Tags.remove({ name: tags[i], user: Meteor.userId() });
				Session.set("currentTag", "");
			}
		}
	},
	"click a.completed": function () {
		Session.set("currentList", "completed");
	},
	"click a.pending": function () {
		Session.set("currentList", "pending");
	}
});

Template.todosUI.items = function () {
	var tag = Tags.findOne(Session.get("currentTag"));
	if (tag != null) {
		var name = tag.name;
	} else {
		var name = "";
	}
	
	if (Session.equals("currentList", "completed")) {
		if (name == "") {
			return Items.find({ user: Meteor.userId(), completed: "checked='true'" },
							  { sort: { priority: 1 } });
		}
		return Items.find({ user: Meteor.userId(), completed: "checked='true'",
							tags: name },
						  { sort: { priority: -1 } });
	} else if (Session.equals("currentList", "pending")) {
		if (name == "") {
			return Items.find({ user: Meteor.userId(), completed: "" },
							  { sort: { priority: 1 } });
		}
		return Items.find({ user: Meteor.userId(), completed: "",
							tags: name },
						  { sort: { priority: -1 } });
	}
	if (name == "") {
		return Items.find({ user: Meteor.userId(), list: Session.get("currentList") },
						  { sort: { priority: -1 } });
	}
	return Items.find({ list: Session.get("currentList"), user: Meteor.userId(),
						tags: name },
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
