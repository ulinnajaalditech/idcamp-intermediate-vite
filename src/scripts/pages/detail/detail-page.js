import Map from "../../utils/maps";
import DetailPresenter from "./detail-presenter";
import * as STORY_API from "../../data/api";
import { parseActivePathname } from "../../utils/url-parser";
import { generatePopoutMap } from "../../components/templates";

export default class Detail {
  #presenter;
  #map;
  #pendingMarkers = {
    coordinate: [0, 0],
    markerOptions: {},
    popupOptions: {},
  };

  async render() {
    return `
        <section id="detail-container" class="container mt-24 mb-20">
            <div id="detail-story" class=""></div>
            <div id="detail-story-loading-container" class="hidden"></div>
        </section>`;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter(parseActivePathname().id, {
      view: this,
      model: STORY_API,
    });

    await this.#presenter?.initialStory();
  }

  async populateStory(message, story) {
    if (!story) {
      this.populateStoryError(message);
      return;
    }

    const container = document.getElementById("detail-story");

    const html = `
        <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 items-center justify-center mb-5">
               <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">${
                 story.name
               }</h1>
                <p class="text-sm sm:text-xl lg:text-2xl font-medium text-center">"${
                  story.description
                }"</p>
            </div>

            <div class="grid grid-cols-12 gap-4">

                <div class="relative col-span-12 lg:col-span-8 w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-lg card !bg-white">
                    <img src="${story.photoUrl}" alt="${story.name}-${
      story.description
    }" class="h-full w-full object-contain rounded-t-lg"/>
                </div>
                ${
                  story.location
                    ? `
                        <div id="map" class="h-[350px] sm:h-[500px] lg:h-[600px] col-span-12 lg:col-span-4 rounded-2xl card"></div>
                    `
                    : ""
                }
            </div>

        </div>
    `;

    container.innerHTML = html;

    this.storeMarkerData(story);
  }

  storeMarkerData(story) {
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

    this.#pendingMarkers = {
      coordinate,
      markerOptions,
      popupOptions,
    };
  }

  processPendingMarkers() {
    if (!this.#map || !this.#pendingMarkers) return;

    const { coordinate, markerOptions, popupOptions } = this.#pendingMarkers;
    if (coordinate && markerOptions && popupOptions) {
      this.#map.addMarker(coordinate, markerOptions, popupOptions);
    } else {
      console.warn("No pending markers to process");
    }
  }

  async initialMap() {
    try {
      const mapElement = document.getElementById("map");
      if (mapElement && mapElement.clientHeight === 0) {
        mapElement.style.height = "400px";
      }

      this.#map = await Map.build("#map", {
        zoom: 10,
        center: this.#pendingMarkers.coordinate,
        locate: true,
      });

      this.processPendingMarkers();
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  }

  populateStoryError(message) {
    const container = document.getElementById("detail-story");
    const html = `
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
    container.innerHTML = html;
  }

  showLoading() {
    console.log("showLoading");
  }

  hideLoading() {
    console.log("hideLoading");
  }
}
