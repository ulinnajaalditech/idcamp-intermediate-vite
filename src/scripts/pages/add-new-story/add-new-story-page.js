import * as STORY_API from "../../data/api";
import AddNewStoryPresenter from "./add-new-story-presenter";
import { convertBase64ToBlob } from "../../utils";
import Camera from "../../utils/camera";
import Map from "../../utils/maps";
import useToast from "../../utils/toast";

export default class AddNewStory {
  #presenter;
  #form;
  #camera;
  #isCameraOpen;
  #takenPicture;
  #map;

  async render() {
    return `
        <section class="page-wrapper">
            <div class="flex flex-col gap-1 items-center justify-center text-center mb-5">
                <h1 class="text-xl md:text-2xl font-bold">Cerita apa hari ini?</h1>
                <p class="text-sm md:text-base">Lengkapi form dibawah untuk membagikan cerita</p>
            </div>
            <div class="card flex items-center justify-center">
                <form id="add-new-story-form" class="flex flex-col gap-5 w-full max-w-lg">
                    <div class="flex flex-col gap-2">
                        <label for="description" class="text-sm font-medium">Deskripsi</label>
                        <textarea id="description" name="description" placeholder="Ceritakan kisahmu disini..." required class="textarea-custom"></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="input-picture" class="text-sm font-medium">Foto</label>
                        <div class="flex items-center flex-wrap gap-2">
                            <button id="action-input-picture" type="button" class="button-custom-neutral">Ambil Gambar</button>
                            <input
                                id="input-picture"
                                name="documentations"
                                type="file"
                                accept="image/*"
                                hidden="hidden"
                                aria-multiline="true"
                                aria-describedby="picture-preview"
                            >
                            <button id="action-open-camera" type="button" class="button-custom-neutral">Buka Kamera</button>
                        </div>
                        <div id="camera-container" class="card !hidden">
                            <video id="camera-video" class="rounded-base w-full block">
                                Video stream not available.
                            </video>
                            <canvas id="camera-canvas" class="hidden"></canvas>
            
                            <div class="flex flex-col gap-2 ">
                                <select id="camera-select" class="select-custom !w-full">
                                </select>
                                <div class="new-form__camera__tools_buttons">
                                <button id="camera-take-button" class="button-custom-neutral" type="button">
                                    Ambil Gambar
                                </button>
                                </div>
                            </div>
                        </div>
                        <div id="documentations-taken-list" class="flex items-center justify-center mt-2">
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <p class="text-sm font-heading leading-none">Lokasi</p> 
                        <div id="map" ></div>
                        <div id="map-loading-container" class="hidden"></div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="number" name="latitude" value="-6.175389" class="input-custom" disabled>
                            <input type="number" name="longitude" value="106.827139" class="input-custom" disabled>
                        </div>
                    </div>
                    <div id="submit-button-container" >
                        <button type="submit" id="submit-button" class="button-custom">Kirim Cerita</button>
                    </div>
                </form>
            </div>
        </section>
        `;
  }

  async afterRender() {
    this.#presenter = new AddNewStoryPresenter({
      view: this,
      model: STORY_API,
    });

    this.#takenPicture = null;

    this.#presenter.showNewFormMap();

    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById("add-new-story-form");
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!this.#takenPicture) {
        useToast(
          "Silahkan ambil gambar atau pilih gambar terlebih dahulu",
          "error"
        );
        return;
      }

      const data = {
        description: this.#form?.description.value,
        photo: this.#takenPicture?.blob,
        lat: this.#form?.latitude.value,
        lon: this.#form?.longitude.value,
      };

      await this.#presenter?.postNewStory(data);
    });

    const actionInputPicture = document.getElementById("action-input-picture");
    const inputPicture = document.getElementById("input-picture");
    const cameraContainer = document.getElementById("camera-container");
    const actionOpenCamera = document.getElementById("action-open-camera");

    actionInputPicture?.addEventListener("click", () => {
      inputPicture.click();
    });

    inputPicture?.addEventListener("change", async (event) => {
      const insertingPicture = event.target.files?.[0];
      if (insertingPicture) {
        this.#takenPicture = {
          blob: insertingPicture,
        };
        await this.#populateTakenPicture();
      }
    });

    actionOpenCamera?.addEventListener("click", async (event) => {
      cameraContainer.classList.toggle("!hidden");
      this.#isCameraOpen = !this.#isCameraOpen;
      if (this.#isCameraOpen) {
        event.currentTarget.textContent = "Tutup Kamera";
        this.#setupCamera();
        await this.#camera?.launch();

        return;
      }
      event.currentTarget.textContent = "Buka Kamera";
      this.#camera?.stop();
    });
  }

  async initialMap() {
    try {
      const mapElement = document.getElementById("map");
      if (mapElement && mapElement.clientHeight === 0) {
        mapElement.style.height = "300px";
      }

      this.#map = await Map.build("#map", {
        zoom: 10,
        locate: true,
      });

      const centeredCoordinate = this.#map.getCenter();

      if (
        this.#validateCoordinates(
          centeredCoordinate.latitude,
          centeredCoordinate.longitude
        )
      ) {
        this.#updateLatLngInput(
          centeredCoordinate.latitude,
          centeredCoordinate.longitude
        );

        const draggableMarker = this.#map.addMarker(
          [centeredCoordinate.latitude, centeredCoordinate.longitude],
          { draggable: true }
        );

        if (draggableMarker) {
          draggableMarker.addEventListener("move", (event) => {
            const coordinate = event.target.getLatLng();

            if (this.#validateCoordinates(coordinate.lat, coordinate.lng)) {
              this.#updateLatLngInput(coordinate.lat, coordinate.lng);
            }
          });

          this.#map.addMapEventListener("click", (event) => {
            const mouseEvent = event;

            if (
              this.#validateCoordinates(
                mouseEvent.latlng.lat,
                mouseEvent.latlng.lng
              )
            ) {
              draggableMarker.setLatLng(mouseEvent.latlng);
              this.#updateLatLngInput(
                mouseEvent.latlng.lat,
                mouseEvent.latlng.lng
              );
            }
          });
        }
      }
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  }

  #validateCoordinates(lat, lng) {
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  #updateLatLngInput(latitude, longitude) {
    if (!this.#form) return;

    const lat = parseFloat(latitude.toFixed(6));
    const lng = parseFloat(longitude.toFixed(6));

    const longitudeInput = this.#form.elements.namedItem("longitude");
    const latitudeInput = this.#form.elements.namedItem("latitude");

    if (longitudeInput) longitudeInput.value = String(lng);
    if (latitudeInput) latitudeInput.value = String(lat);
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (typeof image === "string") {
      blob = await convertBase64ToBlob(image, "image/png");
    }

    if (blob) {
      this.#takenPicture = {
        blob: blob,
      };
    }
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-video"),
        canvas: document.getElementById("camera-canvas"),
        cameraSelect: document.getElementById("camera-select"),
      });

      this.#camera.addCheeseButtonListener(
        document.getElementById("camera-take-button"),
        async () => {
          const image = await this.#camera?.takePicture();
          if (image) {
            await this.#addTakenPicture(image);
            await this.#populateTakenPicture();
          }
        }
      );
    }
  }

  async #populateTakenPicture() {
    if (!this.#takenPicture) return;

    const imageUrl = URL.createObjectURL(this.#takenPicture.blob);
    const html = `
            <div class="relative w-lg h-[400px] card !p-0">
                <img 
                    id="picture-preview"
                    src="${imageUrl}"
                    alt="Preview Gambar"
                    class="object-contain rounded-2xl w-full h-full"
                />
                <button id="action-delete-picture" type="button" class="absolute top-2 right-2 button-custom-destructive">
                    X
                </button>
            </div>
    `;
    const container = document.getElementById("documentations-taken-list");
    container.innerHTML = html;

    const deleteButton = document.getElementById("action-delete-picture");
    deleteButton.addEventListener("click", () => {
      this.#takenPicture = null;
      container.innerHTML = "";
    });
  }

  storeSuccessfully(message) {
    useToast(message, "success");
    this.clearForm();

    location.hash = "/";
  }

  storeFailed(message) {
    useToast(message, "error");
  }

  clearForm() {
    this.#form?.reset();
  }

  showSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById(
      "submit-button-container"
    );
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
            <button class="button-custom w-full" type="submit" disabled>
                <i class="fas fa-spinner animate-spin"></i> Kirim Cerita
            </button>
        `;
    }
  }

  hideSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById(
      "submit-button-container"
    );
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
            <button class="button-custom w-full" type="submit">Kirim Cerita</button>
        `;
    }
  }

  showMapLoading() {
    const container = document.getElementById("map-loading-container");
    container.classList.remove("hidden");
    container.classList.add("maps-loading-container", "!h-[300px]");
  }

  hideMapLoading() {
    const mapContainer = document.getElementById("map");
    const container = document.getElementById("map-loading-container");
    container.classList.add("hidden");
    container.classList.remove("maps-loading-container", "!h-[300px]");
    mapContainer.classList.add("maps-container", "!h-[300px]");
    container.innerHTML = "";
  }
}
