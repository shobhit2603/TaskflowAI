import { redirect } from "next/navigation";

/**
 * Root page — immediately redirects based on intent.
 * The actual auth check (token valid?) happens in the dashboard layout.
 * This just provides a sensible default URL behaviour.
 */
export default function RootPage() {
  redirect("/dashboard");
}
