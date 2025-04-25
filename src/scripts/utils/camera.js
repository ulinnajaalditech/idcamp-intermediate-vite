export default class Camera {
  constructor({ video, cameraSelect, canvas, options = {} }) {
    this.currentStream = undefined;
    this.streaming = false;
    this.width = 640;
    this.height = 0;

    this.videoElement = video;
    this.selectCameraElement = cameraSelect;
    this.canvasElement = canvas;

    this.takePictureButton = undefined;

    this.initialListener();
  }

  static addNewStream(stream) {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [stream];
      return;
    }

    window.currentStreams = [...window.currentStreams, stream];
  }

  static stopAllStreams() {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [];
      return;
    }

    window.currentStreams.forEach((stream) => {
      if (stream.active) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
  }

  initialListener() {
    this.videoElement.oncanplay = () => {
      if (this.streaming) {
        return;
      }

      this.height =
        (this.videoElement.videoHeight * this.width) /
        this.videoElement.videoWidth;

      this.canvasElement.setAttribute("width", this.width.toString());
      this.canvasElement.setAttribute("height", this.height.toString());

      this.streaming = true;
    };

    this.selectCameraElement.onchange = async () => {
      await this.stop();
      await this.launch();
    };
  }

  async populateDeviceList(stream) {
    try {
      if (!(stream instanceof MediaStream)) {
        return Promise.reject(new Error("MediaStream not found!"));
      }

      const deviceId = stream.getVideoTracks()[0].getSettings().deviceId;

      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      const list = enumeratedDevices.filter(
        (device) => device.kind === "videoinput"
      );

      const html = list.reduce((accumulator, device, currentIndex) => {
        return accumulator.concat(`
            <option
              value="${device.deviceId}"
              ${deviceId === device.deviceId ? "selected" : ""}
            >
              ${device.label || `Camera ${currentIndex + 1}`}
            </option>
          `);
      }, "");

      this.selectCameraElement.innerHTML = html;
    } catch (error) {
      console.error("#populateDeviceList: error:", error);
    }
  }

  async getStream() {
    try {
      const deviceId =
        !this.streaming && !this.selectCameraElement.value
          ? undefined
          : { exact: this.selectCameraElement.value };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 4 / 3,
          deviceId,
        },
      });

      await this.populateDeviceList(stream);

      return stream;
    } catch (error) {
      console.error("#getStream: error:", error);
      return null;
    }
  }

  async launch() {
    const stream = await this.getStream();

    if (stream) {
      this.currentStream = stream;
      Camera.addNewStream(this.currentStream);
      this.videoElement.srcObject = this.currentStream;
      this.videoElement.play();
    } else {
      console.error("Failed to get camera stream");
    }

    this.clearCanvas();
  }

  stop() {
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.streaming = false;
    }

    if (this.currentStream instanceof MediaStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
    }

    this.clearCanvas();
  }

  clearCanvas() {
    const context = this.canvasElement.getContext("2d");
    context.fillStyle = "#AAAAAA";
    context.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  async takePicture() {
    if (!(this.width && this.height)) {
      return null;
    }

    const context = this.canvasElement.getContext("2d");

    this.canvasElement.width = this.width;
    this.canvasElement.height = this.height;

    context.drawImage(this.videoElement, 0, 0, this.width, this.height);

    return await new Promise((resolve) => {
      this.canvasElement.toBlob((blob) => resolve(blob));
    });
  }

  addCheeseButtonListener(button, callback) {
    if (typeof button === "string") {
      this.takePictureButton = document.querySelector(button);
    } else {
      this.takePictureButton = button;
    }

    this.takePictureButton.onclick = callback;
  }
}

if (!Array.isArray(window.currentStreams)) {
  window.currentStreams = [];
}
