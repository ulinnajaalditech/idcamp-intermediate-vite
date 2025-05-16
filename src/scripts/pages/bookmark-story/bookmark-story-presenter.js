import { storyMapper } from "../../data/api-mapper";

export default class BookmarkStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialStories() {
    this.#view.showLoading();

    let storiesData;

    try {
      const response = await this.#model.getAllStories();

      storiesData = await Promise.all(
        response.map(async (story) => {
          const report = await storyMapper(story);
          return report;
        })
      );
    } catch (error) {
      console.error("initialStories: error:", error);
      this.#view.populateStoriesListError(error?.message);
      return;
    } finally {
      this.#view.hideLoading();
    }

    if (storiesData) {
      this.#view.populateStoriesList("Success", storiesData);
    }
  }
}
