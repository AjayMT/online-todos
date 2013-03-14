Lists = new Meteor.Collection("lists");
Items = new Meteor.Collection("items");
Tags = new Meteor.Collection("tags");

Meteor.methods({
	"clearList": function (listId) {
		var tags = [];
		var itemCursor = Items.find({ user: this.userId, list: listId });
		itemCursor.forEach(
			function (item) {
				for (var i = 0; i < item.tags.length; i++) {
					if (tags.indexOf(item.tags[i]) == -1) {
						tags.push(item.tags[i]);
					}
				}
			}
		);
		Items.remove({ list: listId, user: this.userId });
		Lists.remove(listId);
		for (var i = 0; i < tags.length; i++) {
			var items = Items.find({ user: Meteor.userId(), tags: tags[i] }).fetch();
			if (items.length == 0) {
				var tagId = Tags.findOne({ name: tags[i], user: Meteor.userId() })._id;
				Tags.remove(tagId);
			}
		}
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
	remove: function (userId, tag) {
		return tag.user == userId;
	}
});
