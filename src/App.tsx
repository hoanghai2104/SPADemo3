import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { lazy } from "react";

const About = lazy(() =>
  import("./pages/About").then((module) => ({ default: module.About })),
);

const Documentation = lazy(() =>
  import("./pages/Documentation").then((module) => ({
    default: module.Documentation,
  })),
);

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/documentation" element={<Documentation />} />
      </Routes>
    </Layout>
  );
};

export { App };
