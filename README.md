# Online To-Dos (In Progress)

This is a web app that allows people to manage their todo lists. They sign in, and see a list of their todos. They can change
items in a list, filter them by tags, create/remove lists, etc. The app is currently in progress, but hopefully it won't
take long to finish.

## Downloading And Running

This app was created with [Meteor](http://meteor.com) and [Meteorite](http://oortcloud.github.com/meteorite), so you'll
first need to install those -

    $ curl https://install.meteor.com/ | /bin/sh # This will install Meteor.
    $ npm install -g meteorite # You need node.js for this.
    $ export PATH=/usr/local/share/npm/bin:${PATH} # Add this to your shell config file.

And then you can actually clone and run the project -

    $ git clone https://github.com/AjayMT/online-todos.git
    $ cd online-todos/online-todos
    $ mrt run

Visit [localhost:3000](http://localhost:3000) to see the app.