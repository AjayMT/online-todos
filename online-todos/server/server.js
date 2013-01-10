Meteor.startup(function () {
	var cursor = Meteor.users.find({});
	cursor.forEach(function (user) {
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
		var html = "Hey there,<br />Here's what you have to do today -<br /><ul>";
		var items = Items.find({ user: user._id, date: date }).fetch();
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
		var cDate = new Date();
		if (cDate.getHours() == 0) {
			cursor.forEach(function (user) {
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
		}
	}, 6000);
});
