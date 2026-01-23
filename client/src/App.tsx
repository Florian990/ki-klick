import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import QuizLanding from "@/pages/quiz-landing";
import VSLPage from "@/pages/vsl";
import AdminStats from "@/pages/admin-stats";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={QuizLanding} />
      <Route path="/vsl" component={VSLPage} />
      <Route path="/admin/stats" component={AdminStats} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
