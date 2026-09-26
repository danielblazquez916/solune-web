import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home/Home';

const About = lazy(() => import('../pages/About/About'));
const Projects = lazy(() => import('../pages/Projects/Projects'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail/ProjectDetail'));
const Services = lazy(() => import('../pages/Services/Services'));
const ServiceDetail = lazy(() => import('../pages/ServiceDetail/ServiceDetail'));
const Contact = lazy(() => import('../pages/Contact/Contact'));
const Legal = lazy(() => import('../pages/Legal/Legal'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/nosotros" element={<About />} />
      <Route path="/proyectos" element={<Projects />} />
      <Route path="/proyectos/:slug" element={<ProjectDetail />} />
      <Route path="/servicios" element={<Services />} />
      <Route path="/servicios/:slug" element={<ServiceDetail />} />
      <Route path="/contacto" element={<Contact />} />
      <Route path="/legal" element={<Legal tab="notice" />} />
      <Route path="/privacidad" element={<Legal tab="privacy" />} />
      <Route path="/cookies" element={<Legal tab="cookies" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
