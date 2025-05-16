import { storyMapper } from "../../data/api-mapper";

export default class DetailPresenter {
  #storyId;
  #view;
  #model;
  #dbModel;

  constructor(storyId, { view, model, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#model = model;
    this.#dbModel = dbModel;
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

  async saveStory() {
    try {
      const data = await this.#model.getDetailStory(this.#storyId);
      await this.#dbModel.putStory(data.story);

      this.#view.saveToBookmarkSuccessfully("Success to save to bookmark");
    } catch (error) {
      console.error("saveStory: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);
      this.#view.saveToBookmarkSuccessfully("Success to remove from bookmark");
    } catch (error) {
      console.error("removeStory: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    const isSaved = await this.#isStorySaved();
    this.#view.renderActionButton(isSaved);
  }

  async #isStorySaved() {
    return !!(await this.#dbModel.getStoryById(this.#storyId));
  }
}
