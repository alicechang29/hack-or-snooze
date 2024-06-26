const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

class Story {
  /** Make instance of Story from data object about story:
   *   - {storyId, title, author, url, username, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    console.log("story constructor", { storyId, title, author, url, username, createdAt });
    this.updatedAt = "";
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Static method to fetch a story from the API.
   *
   * Accepts:
   *  - storyId: string
   *
   * Returns: new Story instance of the fetched story.
   */
  static async getStory(storyId) {
    const response = await fetch(`${BASE_URL}/stories/${storyId}`);
    const data = await response.json();
    const storyData = data.story;
    return new Story(storyData);
  }


  /** Parses hostname out of URL and returns it.
   *
   * http://foo.com/bar => foo.com
   *
   */

  getHostName() {
    const url = new URL(this.url);
    console.log(url.hostname); // "www.example.com"

    return url.hostname;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 *****************************************************************************/

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await fetch(`${BASE_URL}/stories`);
    const data = await response.json();

    // turn plain old story objects from API into instances of Story class
    const stories = data.stories.map((s) => new Story(s));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Send story data to API, make a Story instance, and add it as the first
   * item to this StoryList.
   *
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {

    //get user instance token (needed to post story)
    const token = user.loginToken;

    //create object containing token and story object
    const requestData = { token, story: newStory }; // => {token: "USER_TOKEN", story{...}}

    const response = await fetch(
      `${BASE_URL}/stories`,
      {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });


    const storyData = await response.json();
    console.log("addedStory", storyData);

    const story = new Story(storyData.story);
    this.stories.unshift(story);
    console.log("story passed through story instance", story);

    return story;
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 *****************************************************************************/

class User {
  constructor(
    {
      username,
      name,
      createdAt,
      favorites = [],
      ownStories = [],
    },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store login token on the user so that it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const body = JSON.stringify({ user: { username, password, name } });
    const resp = await fetch(`${BASE_URL}/signup`, { method: "POST", body });
    if (!resp.ok) {
      throw new Error("Signup failed");
    }
    const data = await resp.json();
    const { user, token } = data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      token,
    );
  }

  /** Login in user with API, make User instance & return it.


     * - username: an existing user's username
     * - password: an existing user's password
     */

  static async login(username, password) {
    const body = JSON.stringify({ user: { username, password } });
    const resp = await fetch(`${BASE_URL}/login`, { method: "POST", body });
    if (!resp.ok) throw new Error("Login failed");
    const data = await resp.json();
    const { user, token } = data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      token,
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   *   Returns new user (or null if login failed).
   */

  static async loginViaStoredCredentials(token, username) {
    const qs = new URLSearchParams({ token });
    const response = await fetch(`${BASE_URL}/users/${username}?${qs}`);
    if (!response.ok) {
      console.error("loginViaStoredCredentials failed");
      return null;
    }
    const data = await response.json();
    const { user } = data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      token,
    );
  }

  /**Passing a story argument into the addFavoriteStory fn
   * send a POST request to update the User instance
   * with the updated favorite story
   */
  async addFavoriteStory(favoritedStory) {
    this.favorites.push(favoritedStory); //FIXME: do this after sending to API for future error handling and out of sync

    const token = this.loginToken;

    //create object containing token and user object
    const userData = { token, user: { favorites: this.favorites } };

    const response = await fetch(
      `${BASE_URL}/users/${this.username}/favorites/${favoritedStory.storyId}`, //FIXME: this is not matching API spec
      {
        method: "POST",
        body: JSON.stringify({ token }), //FIXME: this is not matching API spec (just send token)
        headers: {
          "Content-Type": "application/json",
        },
      });
    const updatedUser = await response.json();

    return updatedUser.message;
  }

  /** Input: story instance to unfavorite
   *  remove story from user favorites
   *  update server about deleted favorite
   */
  async removeFavoriteStory(unfavoritedStory) {

    //FIXME: use an array method
    //find matching ID and delete from internal favorites list
    for (let i = 0; i < this.favorites.length; i++) {
      const storyID = this.favorites[i].storyId;

      if (storyID === unfavoritedStory.storyId) {
        console.log("in if statement!");
        this.favorites.splice(i, 1);
        break;
      }
    }

    //create object containing token and user object
    const token = this.loginToken;
    const userData = { token, user: { favorites: this.favorites } };

    const response = await fetch(
      `${BASE_URL}/users/${this.username}/favorites/${unfavoritedStory.storyId}`, //FIXME: doesn't match api spec
      {
        method: "DELETE",
        body: JSON.stringify(userData),//FIXME: doesn't match api spec
        headers: {
          "Content-Type": "application/json",
        },
      });
    const updatedUser = await response.json();

    return updatedUser.message;
  }

  /** returns true/false if the story instance exists in the user's favorites list
   */
  isFavorite(story) { //FIXME: rename to checkIsFavorite
    //FIXME: use array method
    for (let i = 0; i < this.favorites.length; i++) {
      if (this.favorites[i].storyId === story.storyId) {
        return true;
      }
    }
    return false;
  }
}

export { Story, StoryList, User, BASE_URL };
