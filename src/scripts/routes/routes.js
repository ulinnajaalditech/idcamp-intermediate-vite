import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";
import Detail from "../pages/detail/detail-page";
import AddNewStory from "../pages/add-new-story/add-new-story-page";

const routes = {
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/story/:id": () => checkAuthenticatedRoute(new Detail()),
  "/add-new-story": () => checkAuthenticatedRoute(new AddNewStory()),

  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
};

export default routes;
