import HomePresenter from "./home-presenter";
import * as STORY_API from "../../data/api";
import {
  generateCardStory,
  generatePopoutMap,
} from "../../components/templates";
import Map from "../../utils/maps";

export default class HomePage {
  #presenter = null;
  #map = null;
  #pendingMarkers = [];

  async render() {
    return `
        <section id="map-container" class="container mt-24 md:mt-28 lg:mt-32 2xl:mt-40;">
            <div class="flex flex-col gap-1 items-center justify-center mb-5">
                    <img src="./images/logo.svg" alt="Ceritain Logo" class="w-[140px] sm:w-[200px] lg:w-[240px]"/>
                    <p class="text-sm sm:text-xl lg:text-2xl font-medium text-center">Ceritakan semua yang pengen kamu ceritakan!</p>
            </div>
        <div id="map" class="h-64 md:h-96 w-full"></div>
        <div id="map-loading-container" class="hidden"></div>
        </section>
        <section id="stories-container" class="container min-h-[70svh] my-10">
            <div class="flex flex-col gap-5" >
                <div id="list-story" class="story-container"> </div>
                <div id="loading-container" class="hidden"> </div>
            </div>
        </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: STORY_API,
    });

    await this.#presenter?.initialStories();
  }

  populateStoriesList(message, listStory) {
    if (listStory.length === 0) {
      this.populateStoriesListError(message);
      return;
    }

    const container = document.getElementById("list-story");

    if (container) {
      const html = listStory.reduce((acc, story) => {
        this.addStoryMarker(story);
        return acc.concat(generateCardStory(story));
      }, "");
      container.innerHTML = html;

      this.processPendingMarkers();
    } else {
      console.error("list-story element not found");
    }
  }

  addStoryMarker(story) {
    if (
      !story?.location ||
      story.location.latitude == null ||
      story.location.longitude == null
    ) {
      return;
    }

    const lat = parseFloat(String(story.location.latitude));
    const lng = parseFloat(String(story.location.longitude));

    if (isNaN(lat) || isNaN(lng)) {
      console.warn("Invalid coordinates for story:", story.id);
      return;
    }

    const coordinate = [lat, lng];
    const markerOptions = { alt: `${story.name}-${story.description}` };
    const popupOptions = {
      content: generatePopoutMap({ story }),
    };

    if (this.#map && this.#map.isReady()) {
      this.#map.addMarker(coordinate, markerOptions, popupOptions);
    } else {
      this.#pendingMarkers.push({
        coordinate,
        markerOptions,
        popupOptions,
      });
    }
  }

  processPendingMarkers() {
    if (
      !this.#map ||
      !this.#map.isReady() ||
      this.#pendingMarkers.length === 0
    ) {
      return;
    }

    while (this.#pendingMarkers.length > 0) {
      const marker = this.#pendingMarkers.shift();
      if (marker) {
        this.#map.addMarker(
          marker.coordinate,
          marker.markerOptions,
          marker.popupOptions
        );
      }
    }
  }

  async initialMap() {
    try {
      this.#map = await Map.build("#map", {
        zoom: 10,
        locate: true,
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  }

  showLoading() {
    const container = document.getElementById("loading-container");
    container.classList.remove("hidden");
    container.classList.add("story-container");
    Array.from({ length: 3 }).forEach(() => {
      const loadingCard = document.createElement("div");
      loadingCard.classList.add("story-card-skeleton");
      container.appendChild(loadingCard);
    });
  }

  hideLoading() {
    const container = document.getElementById("loading-container");
    container?.classList.add("hidden");
    container?.classList.remove("story-container");
    container.innerHTML = "";
  }

  showMapLoading() {
    const container = document.getElementById("map-loading-container");
    container.classList.remove("hidden");
    container.classList.add("maps-loading-container");
  }

  hideMapLoading() {
    const mapContainer = document.getElementById("map");
    const container = document.getElementById("map-loading-container");
    container.classList.add("hidden");
    container.classList.remove("maps-loading-container");
    mapContainer.classList.add("maps-container");
    container.innerHTML = "";
  }

  populateStoriesListError(message) {
    const container = document.getElementById("stories-container");
    container.classList.remove("page-wrapper");
    container.classList.add("page-error-wrapper");

    container.innerHTML = `
        <div class="flex items-center gap-2 text-center justify-center flex-col h-full">
            <h2 class="text-6xl md:text-8xl font-black">Oops!</h2>
            <p class="text-base md:text-2xl">Terjadi kesalahan pengambilan daftar laporan</p>
            <p class="text-sm md:text-base font-bold text-red-500">${
              message
                ? message
                : "Gunakan jaringan lain atau laporkan error ini."
            }</p>
        </div>
    `;
  }
}
