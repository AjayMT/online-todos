Meteor.startup(function () {
	var cursor = Meteor.users.find({});
	cursor.forEach(function (user) {
		var html = "Hey there,<br />Here's what you have to do today -<br /><ul>";
		var items = Items.find({ user: user._id }).fetch();
		for (var i = 0; i < items.length; i++) {
			html += "<li>" + items[i].name + "</li>";
		}
		html += "</ul><br />Thanks,<br />The Online-Todos team."
		if (items.length > 0) {
			Email.send({ from: "noreply@online-todos.com",
						 to: user.emails[0].address,
						 subject: "Today's to-dos", html: html });
		}
	});
	setInterval(function () {
		cursor.forEach(function (user) {
			var html = "Hey there,<br />Here's what you have to do today -<br /><ul>";
			var items = Items.find({ user: user._id }).fetch();
			for (var i = 0; i < items.length; i++) {
				html += "<li>" + items[i].name + "</li>";
			}
			html += "</ul><br />Thanks,<br />The Online-Todos team."
			if (items.length > 0) {
				Email.send({ from: "noreply@online-todos.com",
							 to: user.emails[0].address,
							 subject: "Today's to-dos", html: html });
			}
		});
	}, 60000 * 60 * 24);
});
