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

Template.todosUI.tagList = function () {
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
		var itemCursor = Items.find({ user: Meteor.userId(), list: this._id });
		itemCursor.forEach(
			function (item) {
				for (var i = 0; i < item.tags.length; i++) {
					var items = Items.find({ user: Meteor.userId(), tags: item.tags[i] }).fetch();
					if (items.length == 1) {
						Tags.remove({ name: item.tags[i], user: Meteor.userId() });
						Session.set("currentTag", "");
					}
				}
			}
		);
		Items.remove({ list: this._id, user: Meteor.userId() });
		Lists.remove(this._id);
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
		for (var i = 0; i < tags.length; i++) {
			if (tags[i] == " " || tags[i] == "") {
				tags.splice(i, 1);
			}
		}
		if (name != "" && priority) {
			for (var i = 0; i < tags.length; i++) {
				var tag = Tags.findOne({ user: Meteor.userId(), name: tags[i] });
				if (tag == null) {
					Tags.insert({ user: Meteor.userId(), name: tags[i] })
				}
			}
			if (Session.equals("editingItem", "") || Session.get("editingItem") == null) {
				Items.insert({ list: Session.get("currentList"), user: Meteor.userId(),
							   name: name, priority: priority, completed: "", tags: tags });
			} else {
				Items.update(Session.get("editingItem"), { $set: { name: name,
																   priority: priority,
																   tags: tags } });
			}
			var allTags = Tags.find({ user: Meteor.userId() }).fetch();
			for (var i = 0; i < allTags.length; i++) {
				var items = Items.find({ user: Meteor.userId(), tags: allTags[i].name }).fetch();
				if (items.length == 0) {
					Tags.remove({ user: Meteor.userId(), name: allTags[i].name });
				}
			}
			Session.set("editingItem", "");
		} else {
			alert("We got an error. Check your stuff and try again. (Make sure the priority field is a number.)");
		}
	},
	"click button.removeItem": function () {
		var tags = this.tags;
		Items.remove(this._id);
		for (var i = 0; i < tags.length; i++) {
			var items = Items.find({ user: Meteor.userId(), tags: tags[i] }).fetch();
			if (items.length == 0) {
				Tags.remove({ name: tags[i], user: Meteor.userId() });
				Session.set("currentTag", "");
			}
		}
	},
	"dblclick tr.itemRow": function () {
		$("#addItem").modal("show");
		document.getElementsByName("itemName")[0].value = this.name;
		document.getElementsByName("itemPriority")[0].value = this.priority;
		for (var i = 0; i < this.tags.length; i++) {
			var value = document.getElementsByName("itemTag")[0].value;
			if (value != "") {
				document.getElementsByName("itemTag")[0].value = value + " " + this.tags[i];
			} else {
				document.getElementsByName("itemTag")[0].value = value + this.tags[i];
			}
		}
		Session.set("editingItem", this._id);
	},
 	"click a.completed": function () {
		Session.set("currentList", "completed");
	},
	"click a.pending": function () {
		Session.set("currentList", "pending");
	},
	"click a.all": function () {
		Session.set("currentList", "all");
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
	} else if (Session.equals("currentList", "all")) {
		if (name == "") {
			return Items.find({ user: Meteor.userId() }, { sort: { priority: -1 } });
		}
		return Items.find({ user: Meteor.userId(), tags: name }, { sort: { priority: -1 } });
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

Template.todosUI.allList = function () {
	if (Session.equals("currentList", "all")) {
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
