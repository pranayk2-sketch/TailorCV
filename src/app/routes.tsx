import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { AssistantPage } from "./pages/AssistantPage";
import { InternshipsPage } from "./pages/InternshipsPage";
import { InternshipDetailsPage } from "./pages/InternshipDetailsPage";
import { ResumesPage } from "./pages/ResumesPage";
import { UploadResumePage } from "./pages/UploadResumePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/experience",
    Component: ExperiencePage,
  },
  {
    path: "/assistant",
    Component: AssistantPage,
  },
  {
    path: "/internships",
    Component: InternshipsPage,
  },
  {
    path: "/internships/:id",
    Component: InternshipDetailsPage,
  },
  {
    path: "/resumes",
    Component: ResumesPage,
  },
  {
    path: "/upload",
    Component: UploadResumePage,
  },
]);
