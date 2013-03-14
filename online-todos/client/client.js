Meteor.subscribe("lists");
Meteor.subscribe("tags");
Meteor.subscribe("items");

Meteor.Router.add({
	"/": function () {
		if (!Meteor.user()) {
			Meteor.Router.to("/signup/");
			return "loginForm";
		}
		return "todosUI";
	},
	"/signup": function () {
		if (Meteor.user()) {
			Meteor.Router.to("/");
			return "todosUI";
		}
		return "loginForm";
	}
});

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

Template.todosUI.todayList = function () {
	if (Session.equals("currentList", "today")) {
		return "active";
	}
	return "";
}

Template.todosUI.events({
	"click input.itemDate": function () {
		$(".itemDate").datepicker("show");
	},
	"click button.createListButton": function () {
		$("#createList").modal("show");
	},
	"click button.addItemButton": function () {
		document.getElementsByName("itemName")[0].value = "";
		document.getElementsByName("itemPriority")[0].value = "";
		document.getElementsByName("itemTag")[0].value = "";
		document.getElementsByName("itemDate")[0].value = "";
		$("#addItem").modal("show");
	},
	"click a.today": function () {
		Session.set("currentList", "today");
	},
	"click button.close": function () {
		Session.set("editingItem", "");
		Session.set("editingList", "");
		document.getElementsByName("itemName")[0].value = "";
		document.getElementsByName("itemPriority")[0].value = "";
		document.getElementsByName("itemTag")[0].value = "";
		document.getElementsByName("itemDate")[0].value = "";
		document.getElementsByName("listName")[0].value = "";
	},
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
		if (value != "") {
			if (Session.equals("editingList", "") || Session.get("editingList") == null) {
				Lists.insert({ name: value, user: Meteor.userId() });
			} else {
				Lists.update(Session.get("editingList"), { $set: { name: value } });
			}
		} else { alert("You need to enter a name."); }
		Session.set("editingList", "");
		document.getElementsByName("listName")[0].value = "";
	},
	"click button.removeList": function () {
		var tags = [];
		var itemCursor = Items.find({ user: Meteor.userId(), list: this._id });
		itemCursor.forEach(
			function (item) {
				for (var i = 0; i < item.tags.length; i++) {
					if (tags.indexOf(item.tags[i]) == -1) {
						tags.push(item.tags[i]);
					}
				}
			}
		);
		Meteor.call("clearList", [this._id]);
		Lists.remove(this._id);
		Session.set("currentList", "");
		for (var i = 0; i < tags.length; i++) {
			var items = Items.find({ user: Meteor.userId(), tags: tags[i] }).fetch();
			if (items.length == 0) {
				var tagId = Tags.findOne({ name: tags[i], user: Meteor.userId() })._id;
				Tags.remove(tagId);
			}
		}
	},
	"click button.saveItem": function () {
		var name = document.getElementsByName("itemName")[0].value;
		var priority = parseInt(document.getElementsByName("itemPriority")[0].value);
		var date = document.getElementsByName("itemDate")[0].value;
		var tagname = document.getElementsByName("itemTag")[0].value;
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
							   name: name, priority: priority, completed: "", tags: tags, date: date });
			} else {
				Items.update(Session.get("editingItem"), { $set: { name: name,
																   priority: priority,
																   tags: tags,
																   date: date } });
			}
			var allTags = Tags.find({ user: Meteor.userId() }).fetch();
			for (var i = 0; i < allTags.length; i++) {
				var items = Items.find({ user: Meteor.userId(), tags: allTags[i].name }).fetch();
				if (items.length == 0) {
					var tagId = Tags.findOne({ user: Meteor.userId(), name: allTags[i].name })._id;
					Tags.remove(tagId);
				}
			}
			Session.set("editingItem", "");
		} else {
			alert("We got an error. Check your stuff and try again. (Make sure the priority field is a number.)");
		}
		document.getElementsByName("itemName")[0].value = "";
		document.getElementsByName("itemPriority")[0].value = "";
		document.getElementsByName("itemTag")[0].value = "";
		document.getElementsByName("itemDate")[0].value = "";
	},
	"click button.removeItem": function () {
		var tags = this.tags;
		Items.remove(this._id);
		for (var i = 0; i < tags.length; i++) {
			var items = Items.find({ user: Meteor.userId(), tags: tags[i] }).fetch();
			if (items.length == 0) {
				var tagId = Tags.findOne({ name: tags[i], user: Meteor.userId() })._id;
				Tags.remove(tagId);
				Session.set("currentTag", "");
			}
		}
	},
	"dblclick a.list": function () {
		document.getElementsByName("listName")[0].value = this.name;
		$("#createList").modal("show");
		Session.set("editingList", this._id);
	},
	"dblclick tr.itemRow": function () {
		$("#addItem").modal("show");
		document.getElementsByName("itemName")[0].value = this.name;
		document.getElementsByName("itemPriority")[0].value = this.priority;
		document.getElementsByName("itemDate")[0].value = this.date;
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
	},
	"keyup input.search-query": function () {
		var searchVal = document.getElementsByName("itemSearchText")[0].value;
		Session.set("itemSearch", searchVal);
	}
});

Template.todosUI.items = function () {
	var tag = Tags.findOne(Session.get("currentTag"));
	if (tag != null) {
		var name = tag.name;
	} else {
		var name = "";
	}
	
	if (Session.get("itemSearch") == null) {
		Session.set("itemSearch", "");
	}
	
	if (Session.equals("currentList", "completed")) {
		if (name == "") {
			return Items.find({ user: Meteor.userId(), completed: "checked='true'",
								name: { $regex: ".*" + Session.get("itemSearch") + ".*" } },
							  { sort: { priority: 1 } });
		}
		return Items.find({ user: Meteor.userId(), completed: "checked='true'",
							tags: name,
							name: { $regex: ".*" + Session.get("itemSearch") + ".*" } },
						  { sort: { priority: -1 } });
	} else if (Session.equals("currentList", "pending")) {
		if (name == "") {
			return Items.find({ user: Meteor.userId(), completed: "",
								name: { $regex: ".*" + Session.get("itemSearch") + ".*" } },
							  { sort: { priority: 1 } });
		}
		return Items.find({ user: Meteor.userId(), completed: "",
							tags: name,
							name: { $regex: ".*" + Session.get("itemSearch") + ".*" } },
						  { sort: { priority: -1 } });
	} else if (Session.equals("currentList", "all")) {
		if (name == "") {
			return Items.find({ user: Meteor.userId(),
								name: { $regex: ".*" + Session.get("itemSearch") + ".*" } },
							  { sort: { priority: -1 } });
		}
		return Items.find({ user: Meteor.userId(), tags: name,
							name: { $regex: ".*" + Session.get("itemSearch") + ".*" } },
						  { sort: { priority: -1 } });
	} else if (Session.equals("currentList", "today")) {
		var dateObj = new Date();
		var dateDay = dateObj.getDate().toString();
		if (dateDay.length == 1) {
			dateDay = "0" + dateDay;
		}
		var dateMonth = (dateObj.getMonth() + 1).toString();
		if (dateMonth.length == 1) {
			dateMonth = "0" + dateMonth;
		}
		var date = dateMonth + "/" + dateDay + "/" + dateObj.getFullYear().toString()
		if (name == "") {
			return Items.find({ user: Meteor.userId(),
								name: { $regex: ".*" + Session.get("itemSearch") + ".*" }, date: date },
							  { sort: { priority: -1 } });
		} 
		return Items.find({ user: Meteor.userId(), tags: name,
							name: { $regex: ".*" + Session.get("itemSearch") + ".*" }, date: date },
						  { sort: { priority: -1 } });
	}
	if (name == "") {
		return Items.find({ user: Meteor.userId(), list: Session.get("currentList"),
							name: { $regex: ".*" + Session.get("itemSearch") + ".*" } },
						  { sort: { priority: -1 } });
	}
	return Items.find({ list: Session.get("currentList"), user: Meteor.userId(),
						tags: name, name: { $regex: ".*" + Session.get("itemSearch") + ".*" } },
					  { sort: { priority: -1 } });
}

Template.todosUI.itemSearch = function () {
	if (Session.get("itemSearch") == null) {
		return "";
	}
	return Session.get("itemSearch");
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
