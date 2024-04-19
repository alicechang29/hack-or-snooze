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

export function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);
  const $li = document.createElement("li");
  $li.id = story.storyId;
  $li.classList.add("Story", "mt-2");
  $li.innerHTML = `
      <a href="${story.url}" target="a_blank" class="Story-link">
        ${story.title}
      </a>
      <small class="Story-hostname text-muted">(${hostName})</small>
      <small class="Story-author">by ${story.author}</small>
      <small class="Story-user d-block">posted by ${story.username}</small>
    `;
  return $li;
}


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
 * Creates a story instance that is added to the currStoryList
 *
 * Adds new story to the DOM
*/

export async function submitNewStory() {
  const qs = $storyForm.querySelector.bind($storyForm);
  const author = qs("#storyFormAuthor").value;
  const title = qs("#storyFormTitle").value;
  const url = qs("#storyFormURL").value;
  const newStoryObj = { author, title, url };

  const createdStory = await currStoryList.addStory(currentUser, newStoryObj);
  console.log({ createdStory });

  currStoryList.stories.push(createdStory);

  //displaying the new story on the page
  const $markupCreatedStory = generateStoryMarkup(createdStory);
  console.log($markupCreatedStory);
  $allStoriesList.prepend($markupCreatedStory);

  // hide all components and reveal the story list
  hidePageComponents();
  $allStoriesList.classList.remove("d-none");

}

$storyFormBtn.addEventListener("click", submitNewStory);
