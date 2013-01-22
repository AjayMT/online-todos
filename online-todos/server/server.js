Meteor.publish("lists", function () {
	return Lists.find({ user: this.userId });
});

Meteor.publish("items", function () {
	return Items.find({ user: this.userId });
});

Meteor.publish("tags", function () {
	return Tags.find({ user: this.userId });
});
