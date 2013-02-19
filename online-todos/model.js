Lists = new Meteor.Collection("lists");
Items = new Meteor.Collection("items");
Tags = new Meteor.Collection("tags");

Lists.allow({
	insert: function (userId, list) {
		return (list.user == userId && list.name);
	},
	update: function (userId, lists, fields, modifier) {
		return _.all(lists, function (list) {
			return list.user == userId;
		});
	},
	remove: function (userId, lists) {
		return _.all(lists, function (list) {
			return list.user == userId;
		});
	}
});

Items.allow({
	insert: function (userId, item) {
		return (item.user == userId && item.name && item.priority
				&& item.list);
	},
	update: function (userId, items, fields, modifier) {
		return _.all(items, function (item) {
			return item.user == userId;
		});
	},
	remove: function (userId, items) {
		return _.all(items, function (item) {
			return item.user == userId;
		});
	}
});

Tags.allow({
	insert: function (userId, tag) {
		return (tag.user == userId && tag.name);
	},
	update: function (userId, tags, fields, modifier) {
		return _.all(tags, function (tag) {
			return tag.user == userId;
		});
	},
	remove: function (userId, tags) {
		return _.all(tags, function (tag) {
			return tag.user == userId;
		});
	}
});
