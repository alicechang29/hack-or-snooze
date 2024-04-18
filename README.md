Notes:
- when creating a story - need a JSON token
- we need to pass in a user token everytime a user adds/deletes a post
- token needs to be part of the JSON body

{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxMDYiLCJpYXQiOjE3MTM0NjIzNjJ9.4V-Gz9x7wVbpQny_jStJswVpiF385IUWS3iV73HcA_4",
	"user": {
		"createdAt": "2024-04-18T17:46:02.094Z",
		"favorites": [],
		"name": "Test User",
		"stories": [],
		"updatedAt": "2024-04-18T17:46:02.094Z",
		"username": "test106"
	}
}


# Models.js:

## Classes:
- Story: for each story

- StoryList: for list of stories

- User: for logged in user

**why is getStories on Story List not an instance method?**
 Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?
- it's static bc we never have to access the story list again after website is initially loaded
- if only adding 1 new story, no need to get every single story again, just update DOM with that one story

Static = Static properties cannot be directly accessed on instances of the class. Instead, they're accessed on the class itself.
 Public static fields are useful when you want a field to exist only once per class, not on every class instance you create. This is useful for caches, fixed-configuration, or any other data you don't need to be replicated across instances.

- **only ever have 1 story list for the whole website, we would never want to call getStories on a class instance**
- never want multiple story lists to exist
- if it wasn't static, every time we add a story, a new story list would be created on the website

Interacting with API

UI.js:
- reading form values and manipulating DOM

User.js
- login info is stored in local storage:
checkForRememberedUser()

On start:
- immediately getting and showing stories from story list
- checking for remembered user
    -logs in user if there is


User Login -  Flow
1. before login: nav bar is signup/login/generic story list
2. user signs up or logs in
    - 2a. Sign up method is called in User class
3. app saves credentials
4. app logs user in via stored credentials
5. app saving login info in LS
6. Once logged in, updateUI and updateNav is called

Once user logs in:
1. System updates nav bar:  nav bar changes to username / log out (updateNavOnLogin() - nav.js)
2. If user clicks the logo, navAllStories() called and stories is refreshed

Adding a Story - Flow
1. Check if user is logged in
2. Display a form for user to add a story
3. User populates form
4. Upon submit, app is:
- collect the user token via local storage
- calling the addStory function that will:
    - sending a post story request to API
        - post request needs to include:
            - user token
            - story object (get from story form from step3 )
                - convert the story form into a JSON.stringify for the body of the POST
```js
//POST REQUEST SAMPLE
const resp = await fetch(
    `/api/borrow-json`,
    {
      method: "POST",
      body: JSON.stringify({ amt }),
      headers: {
        "Content-Type": "application/json",
      },
    });
```

NOTE: Part 3 flow not finished

Favoriting Stories - Flow
1. If user is logged in, UI should update to show a "star" next to each story
2. User should be able to mark stars next to story
3. Upon star "on", app is:

