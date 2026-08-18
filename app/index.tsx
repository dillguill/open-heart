/**
 * Root route — Expo Router's static web export needs an index.html at the site root
 * (https://<user>.github.io/<repo>/), so this redirects straight into the tabs group.
 */
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/records" />;
}
