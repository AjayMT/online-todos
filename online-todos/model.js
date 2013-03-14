Lists = new Meteor.Collection("lists");
Items = new Meteor.Collection("items");
Tags = new Meteor.Collection("tags");

Meteor.methods({
	"clearList": function (listId) {
		Items.remove({ list: listId, user: this.userId });
	}
});

Lists.allow({
	insert: function (userId, list) {
		return (list.user == userId && list.name);
	},
	update: function (userId, list, field, modifier) {
		return list.user == userId;
	},
	remove: function (userId, list) {
		return list.user == userId;
	}
});

Items.allow({
	insert: function (userId, item) {
		return (item.user == userId && item.name && item.priority
				&& item.list);
	},
	update: function (userId, item, field, modifier) {
		return item.user == userId;
	},
	remove: function (userId, item) {
		return item.user == userId;
	}
});

Tags.allow({
	insert: function (userId, tag) {
		return (tag.user == userId && tag.name);
	},
	update: function (userId, tag, field, modifier) {
		return tag.user == userId;
	},
	remove: function (userId, tags) {
		return tag.user == userId;
	}
});
