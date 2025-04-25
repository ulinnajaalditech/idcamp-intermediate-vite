import CONFIG from "../config";
import { getAccessToken } from "../utils/auth";

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories() {
  const accessToken = getAccessToken();

  const response = await fetch(`${ENDPOINTS.ALL_STORIES}?size=${12}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const results = await response.json();

  return {
    ...results,
    ok: response.ok,
  };
}

export async function getDetailStory(id) {
  const accessToken = getAccessToken();

  const response = await fetch(`${ENDPOINTS.ALL_STORIES}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const results = await response.json();

  return {
    ...results,
    ok: response.ok,
  };
}

export async function mutateNewStory({ description, photo, lat, lon }) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  formData.append("lat", lat.toString());
  formData.append("lon", lon.toString());

  const response = await fetch(`${ENDPOINTS.ADD_NEW_STORY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const results = await response.json();

  return {
    ...results,
    ok: response.ok,
  };
}
