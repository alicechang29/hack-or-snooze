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

***Factory method*** - a method on the class itself that calls itself to make an instance of the class
- called Factory method bc it's building an instance
- why should we make an instance just to make an instance?
    - instead, make a method on the class itself so that we can create the actual story list that we are going to use

How to decide to make a function static?
- don't need a cat to make a cat
- want to make a cat from the idea of a cat
else, can pull out the function outside of the class but OO is to keep things grouped together


**Interacting with API**

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

Favoriting Stories -

Logic Flow
When user "stars" an article:
1. Add 2 methods to USER class:
    - Favorite
    - Unfavorite
2. For both methods, reference a Story instance -- need to pull the storyID
from the Div of the "star" selection

when referencing the story id, we will get:
```
story {
			"author": "Kaitlyn",
			"createdAt": "2024-04-18T17:24:08.868Z",
			"storyId": "43b0eec6-9e41-447a-acd5-fd87613bd50c",
			"title": "wow",
			"updatedAt": "2024-04-18T17:24:08.868Z",
			"url": "https://www.mirror.co.uk/news/weird-news/",
			"username": "coconutluver"
		}
```

story

After favorite/unfavorite action:
1. log the favorite story in the "favorite array" on the user (this is on the User class - constructor) by: **DONE**
    - adding the current story selected onto the favorite array
2. for removal, same selection process but find the index of that story on the array and remove it **DONE**
    - array's index's value > find the matching storyID > remove the array value at that index
        - loop the array > find the story's object id key > check for matching id value at that array index, splice it out
3. make a POST request to the server of the change on the user instance and send: **DONE**
    - token
    - user: {favoritesArray}
            - Note: no need to send other user key/values

- save the favorites array every time it's changed, like however currentList is being saved **DONE**


UI Flow
1. If user is logged in, UI should update to show a "star" next to each story
2. User should be able to mark stars next to story
3. User navigates to Favorites page:
- Clear the page
- Make favorites divs visible (add a class to each article about favorite/not favorite)
    -- by default, no stories are favorited = nothing on favorites page
    -- if favorited, story class will have a "favoriteStory" turn on
    -- if unfavorited, it will turn off





# Testing in the console
```js
const {  Story, StoryList, User, BASE_URL } = await import("./js/models.js")

let currStoryList = new StoryList

let currentUser = new User({"createdAt": "2024-04-18T17:46:02.094Z",
		"favorites": [],
		"name": "Test User",
		"stories": [],
		"updatedAt": "2024-04-18T17:46:02.094Z",
		"username": "test106"})

let newStory = await currStoryList.addStory(currentUser,
  {title: "Test", author: "Me", url: "http://meow.com"});

"loginToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxMDYiLCJpYXQiOjE3MTM0NjIzNjJ9.4V-Gz9x7wVbpQny_jStJswVpiF385IUWS3iV73HcA_4",

{updatedAt: '', storyId: '522667dd-8126-470f-af37-6fc8ab5d2253', title: 'Test', author: 'Me', url: 'http://meow.com'}
```
- alternative approach for setting up testing:
import: main, stories, user
    - no need to import models and have to re-enter user each time


Steps for testing:
1. declare a story in console
let testStory = stories.currStoryList.stories[0]
user.currentUser.favorites
user.currentUser.addFavoriteStory(testStory)
user.currentUser.removeFavoriteStory(testStory)


FIXME:
- after submitting story, the submit story form does not disappear -- DONE
- we are not refreshing the story list correctly after form submission -- DONE
    - pressed submit > page was not updating
    - but if refresh website, it works


-fixing docstrings, var names, bootstrap form, hostname fn?


Notes:
- why to add a story to currStoryList when just adding to dom: need to add story to existing list bc might have functionality that relies on this later

TODO:
- bootstrap submit story form


Want to keep things together:
- currStoryList belongs on models.js bc that is where the instance of that story list was born


# QUESTIONS
- in addFavoriteStory method in user class, we are awaiting the response but in the console, it is returning a Promise. Why is this happening?
- why are we writing 2 methods for favorite/unfavorite? For both, we are updating the favorite list on the user
    - only difference would be adding or removing the selected story from the favorites array
