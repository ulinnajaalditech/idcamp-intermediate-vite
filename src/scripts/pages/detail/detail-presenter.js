import { storyMapper } from "../../data/api-mapper";

export default class DetailPresenter {
  #storyId;
  #view;
  #model;

  constructor(storyId, { view, model }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#model = model;
  }

  async initialStory() {
    this.#view.showLoading();

    let storyData;

    try {
      const response = await this.#model.getDetailStory(this.#storyId);
      if (!response.ok) {
        console.error("initialStory: error:", response);
        this.#view.populateStoryError(response.message);
        return;
      }

      storyData = await storyMapper(response.story);

      // First populate the story - this creates the map container in the DOM
      this.#view.populateStory("Success", storyData);

      // Then initialize the map after the container exists
      await this.#view.initialMap();
    } catch (error) {
      console.error("initialStory: error:", error);
      this.#view.populateStoryError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
