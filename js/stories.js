// This is the global list of all stories (an instance of StoryList)
import {
  $allStoriesList,
  $storiesLoadingMsg,
  $storyFormBtn,
  $storyForm
} from "./dom";
import { Story, StoryList } from "./models";
import { currentUser } from "./user";
import { hidePageComponents } from "./main";

export let currStoryList;

/******************************************************************************
 * Generating HTML for a story
 *****************************************************************************/

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns DOM object for the story.
 */

//
export function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);

  //check if user favorites list includes story instance
  let favoriteStatus = currentUser.isFavorite(story);

  //https://icons.getbootstrap.com/?q=star
  const $li = document.createElement("li");
  $li.id = story.storyId;
  $li.classList.add("Story", "mt-2");
  $li.innerHTML = `
      <small class="Story-star d-none bi bi-star"><i class=""></i></small>
      <a href="${story.url}" target="a_blank" class="Story-link">
        ${story.title}
      </a>
      <small class="Story-hostname text-muted">(${hostName})</small>
      <small class="Story-author">by ${story.author}</small>
      <small class="Story-user d-block">posted by ${story.username}</small>

    `;

  if (showStar === true && favoriteStatus === true) {
    //and story exists in favorites
    $li.querySelector(".Story-star").classList.remove("d-none");
    $li.querySelector(".Story-star").classList.remove("bi-star");
    $li.querySelector(".Story-star").classList.add("bi-star-fill");
  } else if (showStar === true && favoriteStatus === false) {
    $li.querySelector(".Story-star").classList.remove("d-none");
    $li.querySelector(".Story-star").classList.remove("bi-star-fill");
    $li.querySelector(".Story-star").classList.add("bi-star");
  }




  //if a user is logged in, add unfilled star symbol next to each story in list
  // currentUser ? add the star : dont add the star

  /*
  by default, have the star in the div but have it set to d-none

  if logged in user:
  - is the story on the favorite list
  - if so, make it filled in star

  if not, leave it as unfilled star
  */
  return $li;
}

async function handleFavorites(evt) {
  // checking if story is on favorite list maybe goes here so we can add/remove from same fn
  if (!evt.target.matches(".Story-star")) return;

  const storySelected = evt.target.closest("li");
  const selectedStoryID = storySelected.getAttribute("id");
  const selectedStory = Story.getStory(selectedStoryID);

  //when click star, call addFavorite on the story that was clicked
  const addFavorite = await currentUser.addFavoriteStory(selectedStory);
  console.log({ addFavorite });


  //displaying the new star on the page
  const $markupFavoritedStory = generateStoryMarkup(selectedStory);
  console.log($markupFavoritedStory);
}

$allStoriesList.addEventListener("click", handleFavorites);




//NEXTSTEPS and didnt test stars yet
//add event listener onto the story div
//check if the click = the star's class
// - run the addFavorite or removeFavorite function
// - change the star to filled/unfilled



/******************************************************************************
 * List all stories
 *****************************************************************************/

/** For in-memory list of stories, generates markup & put on page. */

export function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.innerHTML = "";

  for (const story of currStoryList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.classList.remove("d-none");
}


/******************************************************************************
 * Start: show stories
 *****************************************************************************/

/** Get and show stories when site first loads. */

export async function fetchAndShowStoriesOnStart() {
  currStoryList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}


/** Gets values from the story form
 *  Calls generateStoryMarkup, adds the new story to the DOM
 *  Clears form input values upon form submission
 *  Hides all page components, reveals story list
*/

export async function submitNewStory() {
  const qs = $storyForm.querySelector.bind($storyForm);
  const author = qs("#storyFormAuthor").value;
  const title = qs("#storyFormTitle").value;
  const url = qs("#storyFormURL").value;
  const storyData = { author, title, url };

  console.log("storyForm", $storyForm);

  const createdStory = await currStoryList.addStory(currentUser, storyData);
  console.log({ createdStory });

  //displaying the new story on the page
  const $markupCreatedStory = generateStoryMarkup(createdStory);
  console.log($markupCreatedStory);
  $allStoriesList.prepend($markupCreatedStory);

  //reset form fields on submission
  $storyForm.querySelector("form").reset();

  // hide all components and reveal the story list
  hidePageComponents();
  $allStoriesList.classList.remove("d-none");
}

$storyForm.addEventListener("submit", submitNewStory);
