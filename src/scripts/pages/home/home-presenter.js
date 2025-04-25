import { storyMapper } from "../../data/api-mapper";

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showReportsListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
      return true;
    } catch (error) {
      console.error("showReportsListMap: error:", error);
      return false;
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialStories() {
    this.#view.showLoading();

    const mapPromise = this.showReportsListMap();
    let storiesData;

    try {
      const response = await this.#model.getAllStories();
      if (!response.ok) {
        console.error("initialStories: error:", response);
        this.#view.populateStoriesListError(response.message);
        return;
      }

      storiesData = await Promise.all(
        response.listStory.map(async (story) => {
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

    await mapPromise;

    if (storiesData) {
      this.#view.populateStoriesList("Success", storiesData);
    }
  }
}
