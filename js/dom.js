// So we don't have to keep re-finding things on page, find DOM elements once:

export const $storiesLoadingMsg = document.querySelector("#LoadingMsg");
export const $allStoriesList = document.querySelector("#AllStoriesList");

// selector that finds all three story lists
export const $storiesLists = document.querySelector(".stories-list");

export const $loginForm = document.querySelector("#LoginForm");
export const $signupForm = document.querySelector("#SignupForm");

// selectors for the form elements for "Add Story" submission
export const $storyForm = document.querySelector("#submitStoryForm");
export const $storyFormBtn = document.querySelector("#submitStoryBtn");

// selectors for the nav bar
export const $navLogin = document.querySelector("#Nav-login");
export const $navUserProfile = document.querySelector("#Nav-userProfile");
export const $navLogOut = document.querySelector("#Nav-logout");
export const $navAllStories = document.querySelector("#Nav-all");
export const $navAddStory = document.querySelector('#nav-SubmitStory');
